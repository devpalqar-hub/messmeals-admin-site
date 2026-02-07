import styles from "./ConfirmModal.module.css";

type Props = {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal = ({
  open,
  title = "Are you sure?",
  message,
  onConfirm,
  onCancel,
}: Props) => {
  if (!open) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>

        <h3>{title}</h3>
        <p>{message}</p>

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onCancel}>
            Cancel
          </button>

          <button className={styles.confirm} onClick={onConfirm}>
            Yes
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;
