import "@/lib/unistyles";

import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import type { AcceptingModalProps } from "./types";
import { ModalUniversal } from "../modal-universal";
import { styles } from "./styles";

export function ReusableAlertModal(props: AcceptingModalProps) {
  const { theme } = useUnistyles();

  return (
    <ModalUniversal
      visible={props.modalVisible}
      onRequestClose={props.closeModal}
      title={props.modalTitle}
      description={props.modalDescription}
      footer={
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          {props.modalButtons?.map((btn, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={btn.onPress || props.closeModal}
              style={[
                styles.modalButton,
                btn.style === "cancel"
                  ? styles.modalButtonCancel
                  : styles.modalButtonDefault,
              ]}
            >
              <Text
                style={[
                  styles.modalButtonText,
                  btn.style === "cancel" && {
                    color: theme.colors.typography,
                  },
                ]}
              >
                {btn.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      }
    />
  );
}

export function LoadingStatus(props: AcceptingModalProps) {
  const { theme } = useUnistyles();

  return (
    <>
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10, color: theme.colors.muted }}>
          Memuat Soal...
        </Text>
      </View>

      <ReusableAlertModal {...props} />
    </>
  );
}

export function ErrorStatus(props: Omit<AcceptingModalProps, "modalVisible">) {
  useUnistyles();

  return (
    <View style={styles.container}>
      <ReusableAlertModal modalVisible={true} {...props} />
    </View>
  );
}
