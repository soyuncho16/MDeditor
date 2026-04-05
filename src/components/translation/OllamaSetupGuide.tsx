import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { checkOllamaStatus, type OllamaStatus } from "../../lib/translation";
import styles from "./OllamaSetupGuide.module.css";

interface OllamaSetupGuideProps {
  onClose: () => void;
  onModelSelect: (model: string) => void;
  selectedModel: string;
}

export function OllamaSetupGuide({
  onClose,
  onModelSelect,
  selectedModel,
}: OllamaSetupGuideProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<OllamaStatus>({
    connected: false,
    models: [],
  });
  const [checking, setChecking] = useState(false);

  const testConnection = useCallback(async () => {
    setChecking(true);
    const result = await checkOllamaStatus();
    setStatus(result);
    setChecking(false);
  }, []);

  useEffect(() => {
    testConnection();
  }, [testConnection]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{t("translation.setupTitle")}</h2>

        <div
          className={`${styles.status} ${status.connected ? styles.connected : styles.disconnected}`}
        >
          <span>{status.connected ? "\u{1F7E2}" : "\u{1F534}"}</span>
          <span>
            {status.connected
              ? t("translation.connected")
              : t("translation.notRunning")}
          </span>
        </div>

        {!status.connected && (
          <>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                1. {t("translation.installGuide")}
              </div>
              <p>
                <a
                  className={styles.link}
                  href="https://ollama.com/download"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("translation.officialDocs")} ↗
                </a>
              </p>
              <div className={styles.command}>
                {t("translation.installWindows")}
              </div>
              <div className={styles.command}>
                {t("translation.installLinux")}
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                2. {t("translation.modelInstall")}
              </div>
              <div className={styles.command}>
                {t("translation.modelCommand")}
              </div>
            </div>
          </>
        )}

        {status.connected && status.models.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              {t("translation.selectModel")}
            </div>
            <select
              className={styles.select}
              value={selectedModel}
              onChange={(e) => onModelSelect(e.target.value)}
            >
              {status.models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        )}

        {status.connected && status.models.length === 0 && (
          <div className={styles.section}>
            <p>{t("translation.modelNotFound")}</p>
            <div className={styles.command}>
              {t("translation.modelCommand")}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.button} onClick={onClose}>
            {t("dialog.cancel")}
          </button>
          <button
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={testConnection}
            disabled={checking}
          >
            {checking ? "..." : t("translation.testConnection")}
          </button>
        </div>
      </div>
    </div>
  );
}
