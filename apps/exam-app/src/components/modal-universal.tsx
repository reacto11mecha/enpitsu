import React from "react";
import {
  Modal,
  StyleSheet as RNStyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface ModalUniversalProps {
  visible: boolean;
  onRequestClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export const ModalUniversal = ({
  visible,
  onRequestClose,
  title,
  description,
  children,
  footer,
}: ModalUniversalProps) => {
  useUnistyles();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onRequestClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onRequestClose}>
          <View style={styles.overlayBackground} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContent}>
          {/* Header Section - Fixed Height */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {description && (
              <Text style={styles.description}>{description}</Text>
            )}
          </View>

          <View style={styles.separator} />

          {/* Content Section - Flexible Height (Scrollable) */}
          <View style={styles.contentContainer}>{children}</View>

          {/* Footer Section - Fixed Height (Sticky at bottom) */}
          {footer && (
            <>
              <View style={styles.separator} />
              <View style={styles.footer}>{footer}</View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create((theme) => ({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: theme.margins.lg,
  },
  overlayBackground: {
    ...RNStyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: "100%",
    maxWidth: 500,
    maxHeight: "80%",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden",
    flexGrow: 0,
    flexShrink: 1,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: theme.margins.lg,
    paddingBottom: theme.margins.md,
    flexShrink: 0, // Header tidak boleh mengecil/terpotong
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.typography,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: theme.colors.muted,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    width: "100%",
    flexShrink: 0,
  },
  contentContainer: {
    flexShrink: 1,
    width: "100%",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: theme.margins.md,
    gap: 12,
    backgroundColor: theme.colors.background,
    flexShrink: 0, // Footer tidak boleh mengecil/terpotong
  },
}));
