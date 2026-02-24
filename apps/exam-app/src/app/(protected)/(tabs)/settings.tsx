import type { ThemeType } from "@/hooks/useStorage";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { reloadAppAsync } from "expo";
import { ModalUniversal } from "@/components/modal-universal";
import {
  useAuthStore,
  useStudentAnswerStore,
  useThemeStorage,
} from "@/hooks/useStorage";
import { useStudentSubmitHistory } from "@/hooks/useStorage.web";
import { toast } from "@/lib/sonner";
import { useTRPC } from "@/lib/trpc";
import { useQueryClient } from "@tanstack/react-query";

const ThemeOption = ({
  label,
  value,
  description,
  current,
  onSelect,
}: {
  label: string;
  value: ThemeType;
  description?: string;
  current: ThemeType;
  onSelect: (val: ThemeType) => void;
}) => {
  useUnistyles();

  const isSelected = current === value;

  return (
    <TouchableOpacity
      style={styles.optionContainer}
      onPress={() => onSelect(value)}
      activeOpacity={0.7}
    >
      <View style={styles.textWrapper}>
        <Text
          style={[
            styles.optionLabel,
            isSelected ? styles.textSelected : undefined,
          ]}
        >
          {label}
        </Text>
        {description && (
          <Text style={styles.optionDescription}>{description}</Text>
        )}
      </View>

      {/* Radio Button UI */}
      <View style={styles.radioOuter}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  useUnistyles();

  const { theme: currentTheme, setTheme } = useThemeStorage();
  const { npsn, instanceName, token, updateToken, logOut } = useAuthStore();
  const { clearAll: clearAllAnswer } = useStudentAnswerStore();
  const { clearHistory } = useStudentSubmitHistory();

  const [localToken, setLocalToken] = useState(token || "");
  const [isEditingToken, setIsEditingToken] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    logOut();
    clearAllAnswer();
    clearHistory();
    setLogoutModalVisible(false);
  };

  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const handleSaveToken = async () => {
    if (!localToken.trim()) {
      toast.error("Token tidak boleh kosong");
      return;
    }
    updateToken(localToken);
    setIsEditingToken(false);
    clearHistory();
    clearAllAnswer();

    await queryClient.invalidateQueries(trpc.exam.getStudent.pathFilter());

    toast.success("Token berhasil diperbarui", {
      description: "Sesaat lagi aplikasi akan refresh untuk memperbarui data.",
    });

    setTimeout(() => reloadAppAsync("Refresh karena pembaharuan token."), 4000);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Pengaturan</Text>
          <Text style={styles.description}>
            Kelola konfigurasi aplikasi dan sesi anda.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tampilan Aplikasi</Text>

          <View style={styles.card}>
            <ThemeOption
              label="Ikuti Sistem"
              value="system"
              description="Menyesuaikan dengan preferensi perangkat anda"
              current={currentTheme}
              onSelect={setTheme}
            />
            <View style={styles.separator} />
            <ThemeOption
              label="Mode Terang"
              value="light"
              current={currentTheme}
              onSelect={setTheme}
            />
            <View style={styles.separator} />
            <ThemeOption
              label="Mode Gelap"
              value="dark"
              current={currentTheme}
              onSelect={setTheme}
            />
          </View>

          <Text style={styles.helperText}>
            Pilih "Ikuti Sistem" jika Anda ingin aplikasi otomatis berubah warna
            saat HP Anda berganti mode terang/gelap.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identitas Sekolah</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Instansi</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={instanceName || "-"}
                editable={false}
              />
            </View>
            <View style={styles.separator} />
            <View style={styles.inputGroup}>
              <Text style={styles.label}>NPSN</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={npsn?.toString() || "-"}
                editable={false}
              />
              <Text style={styles.helperText}>
                Ingin mengganti NPSN? Anda harus keluar (Logout) terlebih
                dahulu.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Akses</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Token Akses</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={localToken}
                  onChangeText={setLocalToken}
                  placeholder="Masukkan token baru"
                  placeholderTextColor="#a1a1aa"
                  editable={true}
                  onFocus={() => setIsEditingToken(true)}
                />
              </View>
            </View>
            {isEditingToken && localToken !== token && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  onPress={() => {
                    setLocalToken(token || "");
                    setIsEditingToken(false);
                  }}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveToken}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveButtonText}>Simpan Token</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: "#ef4444" }]}>
            Sesi Anda
          </Text>
          <View style={[styles.card, { borderColor: "#fecaca" }]}>
            <Text style={styles.warningText}>
              Logout akan menghapus semua riwayat data yang tersimpan di
              perangkat ini. Pastikan anda sudah screenshot untuk berjaga-jaga.
              Anda dapat masuk kembali menggunakan kredensial yang sama.
            </Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <ModalUniversal
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
        title="Logout"
        description="Apakah anda yakin ingin keluar? Riwayat pengerjaan lokal akan hilang. Anda dapat masuk kembali menggunakan token akses yang sama."
        footer={
          <>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setLogoutModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCancelButtonText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalLogoutButton}
              onPress={confirmLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.modalLogoutButtonText}>Keluar</Text>
            </TouchableOpacity>
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.margins.lg,
    paddingBottom: 40,
  },
  header: {
    marginBottom: theme.margins.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.typography,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: theme.colors.muted,
  },
  section: {
    marginBottom: theme.margins.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.typography,
    marginBottom: theme.margins.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.margins.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputGroup: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.typography,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: theme.colors.inputBg,
    color: theme.colors.typography,
  },
  inputDisabled: {
    backgroundColor: theme.colors.background,
    color: theme.colors.muted,
    borderColor: theme.colors.border,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 4,
    lineHeight: 18,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.margins.md,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: theme.margins.md,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.radius.sm,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    color: theme.colors.typography,
    fontSize: 14,
    fontWeight: "500",
  },
  warningText: {
    fontSize: 13,
    color: theme.colors.muted,
    marginBottom: theme.margins.md,
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: theme.radius.sm,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },

  modalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.typography,
  },
  modalLogoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
  },
  modalLogoutButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  textWrapper: {
    flex: 1,
    paddingRight: 10,
  },
  optionLabel: {
    fontSize: 14,
    color: theme.colors.typography,
    fontWeight: "500",
  },
  textSelected: {
    fontWeight: "700",
    color: theme.colors.primary,
  },
  optionDescription: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
}));
