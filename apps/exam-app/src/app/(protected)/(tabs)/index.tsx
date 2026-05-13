import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Identity } from "@/components/identity";
import { ScanOrInputQuestionSlug } from "@/components/scan-or-input-question-slug";
import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export default function HomeScreen() {
  const { theme } = useUnistyles();

  const trpc = useTRPC();
  const studentQuery = useQuery(trpc.exam.getStudent.queryOptions());

  const [isCorrect, setCorrect] = useState(false);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={studentQuery.isRefetching}
              onRefresh={() => studentQuery.refetch()}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        >
          <View style={styles.contentContainer}>
            <View style={styles.section}>
              <Identity
                title="Sebelum mengerjakan,"
                error={studentQuery.error}
                isPending={studentQuery.isPending}
                student={studentQuery.data?.student}
              />
            </View>

            {!isCorrect ? (
              <View style={styles.actionContainer}>
                <TouchableOpacity
                  onPress={() => setCorrect(true)}
                  style={styles.primaryButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>Ya, sudah benar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.inputSection}>
                <ScanOrInputQuestionSlug
                  resetCorrect={() => setCorrect(false)}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: theme.margins.lg,
  },
  contentContainer: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  section: {
    marginBottom: theme.margins.lg,
  },
  actionContainer: {
    marginTop: theme.margins.sm,
  },
  inputSection: {
    marginTop: theme.margins.sm,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    paddingVertical: 12,
    paddingHorizontal: theme.margins.lg,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
}));
