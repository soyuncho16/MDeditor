import { useTranslation } from "react-i18next";
import styles from "./AppLayout.module.css";

interface StatusBarProps {
  line: number;
  col: number;
}

export function StatusBar({ line, col }: StatusBarProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.statusBar}>
      <span>
        {t("statusBar.line")} {line}, {t("statusBar.column")} {col}
      </span>
      <span>UTF-8</span>
      <span>Markdown</span>
    </div>
  );
}
