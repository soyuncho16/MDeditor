import { useTranslation } from "react-i18next";
import { useEditorStore } from "../../stores/editorStore";
import { TranslateButton } from "../translation/TranslateButton";
import styles from "./AppLayout.module.css";

export function TitleBar() {
  const { t, i18n } = useTranslation();
  const { activeFilePath, isDirty, isTranslating } = useEditorStore();

  const fileName = activeFilePath
    ? activeFilePath.split(/[/\\]/).pop()
    : null;

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "ko" ? "en" : "ko");
  };

  return (
    <div className={styles.titleBar}>
      <span className={styles.titleText}>
        {t("app.title")}
        {fileName && ` — ${fileName}`}
        {isDirty && <span className={styles.dirtyIndicator}> ●</span>}
        {isTranslating && (
          <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>
            {t("translation.translating")}
          </span>
        )}
      </span>
      <div className={styles.titleActions}>
        <TranslateButton />
        <button
          className={styles.langButton}
          onClick={toggleLanguage}
          title={t("language.ko") + " / " + t("language.en")}
        >
          {i18n.language === "ko" ? "한/EN" : "EN/한"}
        </button>
      </div>
    </div>
  );
}
