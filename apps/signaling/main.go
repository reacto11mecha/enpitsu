// This file content is AI Generated code, please do investigation further
// Original Code: https://github.com/yjs/y-webrtc/blob/master/bin/server.js
package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gorilla/websocket"
)

// topics maps topic names to a set (map) of subscribed connections.
var (
	topics   = make(map[string]map[*websocket.Conn]bool)
	topicsMu sync.Mutex
)

// connMutex is used to synchronize writes to each websocket connection.
var connMutex sync.Map // map[*websocket.Conn]*sync.Mutex

const pingTimeout = 30 * time.Second

// upgrader upgrades HTTP connections to WebSocket connections.
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Allow all origins (like the Node code does not check auth).
	CheckOrigin: func(r *http.Request) bool { return true },
}

// safeWriteMessage writes to the connection using a mutex to avoid concurrent writes.
func safeWriteMessage(conn *websocket.Conn, messageType int, data []byte) error {
	m, _ := connMutex.LoadOrStore(conn, &sync.Mutex{})
	mutex := m.(*sync.Mutex)
	mutex.Lock()
	defer mutex.Unlock()
	return conn.WriteMessage(messageType, data)
}

// safeSend marshals a message as JSON and sends it as a text message.
func safeSend(conn *websocket.Conn, message interface{}) {
	data, err := json.Marshal(message)
	if err != nil {
		conn.Close()
		return
	}
	if err := safeWriteMessage(conn, websocket.TextMessage, data); err != nil {
		conn.Close()
		return
	}
}

// onConnection handles a new WebSocket connection.
func onConnection(conn *websocket.Conn) {
	// subscribedTopics tracks which topics this connection is subscribed to.
	subscribedTopics := make(map[string]bool)

	// pongReceived is used to check if a pong was received within the timeout.
	var pongReceived int32 = 1

	// When a pong is received, set pongReceived to true.
	conn.SetPongHandler(func(appData string) error {
		atomic.StoreInt32(&pongReceived, 1)
		return nil
	})

	// Start a ticker to send a ping every pingTimeout.
	ticker := time.NewTicker(pingTimeout)
	done := make(chan struct{})

	go func() {
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				if atomic.LoadInt32(&pongReceived) == 0 {
					conn.Close()
					return
				}
				atomic.StoreInt32(&pongReceived, 0)
				// Send a ping frame.
				if err := safeWriteMessage(conn, websocket.PingMessage, []byte{}); err != nil {
					conn.Close()
					return
				}
			case <-done:
				return
			}
		}
	}()

	// Read loop: process incoming messages.
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			break
		}
		// Expecting JSON data.
		var msg map[string]interface{}
		if err := json.Unmarshal(message, &msg); err != nil {
			continue
		}
		// Check if a "type" property exists.
		msgType, ok := msg["type"].(string)
		if !ok {
			continue
		}

		switch msgType {
		case "subscribe":
			// Expecting "topics" to be an array.
			topicsArr, ok := msg["topics"].([]interface{})
			if !ok {
				continue
			}
			for _, t := range topicsArr {
				topicName, ok := t.(string)
				if !ok {
					continue
				}
				// Add the connection to the topic.
				topicsMu.Lock()
				subs, exists := topics[topicName]
				if !exists {
					subs = make(map[*websocket.Conn]bool)
					topics[topicName] = subs
				}
				subs[conn] = true
				topicsMu.Unlock()
				// Track that this connection is subscribed to this topic.
				subscribedTopics[topicName] = true
			}

		case "unsubscribe":
			topicsArr, ok := msg["topics"].([]interface{})
			if !ok {
				continue
			}
			for _, t := range topicsArr {
				topicName, ok := t.(string)
				if !ok {
					continue
				}
				topicsMu.Lock()
				if subs, exists := topics[topicName]; exists {
					delete(subs, conn)
					if len(subs) == 0 {
						delete(topics, topicName)
					}
				}
				topicsMu.Unlock()
				delete(subscribedTopics, topicName)
			}

		case "publish":
			// Expecting "topic" to be a string.
			topicName, ok := msg["topic"].(string)
			if !ok {
				continue
			}
			topicsMu.Lock()
			receivers, exists := topics[topicName]
			topicsMu.Unlock()
			if exists {
				// Add the number of clients to the message (like the Node code).
				msg["clients"] = len(receivers)
				// Send the message to every subscribed connection.
				for receiver := range receivers {
					safeSend(receiver, msg)
				}
			}

		case "ping":
			// Respond with a pong.
			safeSend(conn, map[string]interface{}{"type": "pong"})
		}
	}

	// Cleanup when the connection is closed.
	close(done)
	topicsMu.Lock()
	for topicName := range subscribedTopics {
		if subs, exists := topics[topicName]; exists {
			delete(subs, conn)
			if len(subs) == 0 {
				delete(topics, topicName)
			}
		}
	}
	topicsMu.Unlock()
	connMutex.Delete(conn)
	conn.Close()
}

// handleWS upgrades an HTTP request to a WebSocket connection.
func handleWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	// Start handling the connection concurrently.
	go onConnection(conn)
}

func main() {
	// Read port from environment variable "PORT", defaulting to 4444.
	port := os.Getenv("PORT")
	if port == "" {
		port = "4444"
	}

	// The HTTP handler: if the request is a websocket upgrade, handle it;
	// otherwise, respond with plain text "okay".
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Upgrade") == "websocket" {
			handleWS(w, r)
			return
		}
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("okay"))
	})

	log.Println("Signaling server running on localhost:" + port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
