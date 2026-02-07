import styles from "./Toast.module.css";

type Props = {
  message: string;
  type: "success" | "error" | "info";
};

const Toast = ({ message, type }: Props) => {
  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      {message}
    </div>
  );
};

export default Toast;
