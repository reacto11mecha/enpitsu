export interface AlertModalConfig {
  visible: boolean;
  title: string;
  description: string;
  buttons?: {
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
  }[];
}

export interface AcceptingModalProps {
  modalVisible: AlertModalConfig["visible"];
  modalTitle: AlertModalConfig["title"];
  modalDescription: AlertModalConfig["description"];
  modalButtons?: AlertModalConfig["buttons"];
  closeModal: () => void;
}

export interface SuccessSubmitProps {
  slug: string;
  title: string;
  checkIn: Date;
  submittedAt: Date;
}
