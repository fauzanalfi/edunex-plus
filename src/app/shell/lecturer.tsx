// Shell dosen (Phase A): signed in as a lecturer, without the student's screens.
// Feeds and antrian come in a later phase; for now the answer is where to teach.
import { Suspense, useState } from "react";
import { EDUNEX_WEB } from "../../core/links";
import { errorKey } from "../bridge";
import { useOpenExternal } from "../hooks";
import { useT } from "../i18n";
import { later } from "../later";
import { displayName } from "../names";
import { useBridge, useDataset } from "../store";
import { AppMark } from "../ui/brand";
import { Button } from "../ui/controls";
import { EmptyState } from "../ui/display";
import { Icons } from "../ui/icons";
import { Page, PageHeader } from "../ui/layout";
import { toast } from "../ui/overlays";
import { PanelBoundary } from "../ui/panel-boundary";

const SettingsDialog = later(() => import("./settings").then((dialog) => dialog.SettingsDialog));

export function LecturerShell() {
  const t = useT();
  const account = useDataset("edunex.account");
  const bridge = useBridge();
  const open = useOpenExternal();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const name = account ? displayName(account.name) : t("lecturer.role");

  const signOut = async () => {
    setSigningOut(true);
    try {
      await bridge.invoke("auth.signOut", {});
    } catch (error) {
      toast(t(errorKey(error)), "danger");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-surface text-fg">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-line px-4">
        <AppMark className="size-7" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-medium">{name}</p>
          <p className="truncate text-caption text-muted">{t("lecturer.role")}</p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setSettingsOpen(true)}>
          {t("lecturer.home.settings")}
        </Button>
        <Button size="sm" variant="secondary" busy={signingOut} onClick={() => void signOut()}>
          {t("action.signOut")}
        </Button>
      </header>
      <main className="min-h-0 flex-1 overflow-auto">
        <PanelBoundary name="lecturer.home">
          <Page>
            <PageHeader title={t("lecturer.home.title")} />
            <EmptyState icon={<Icons.BookOpen className="size-5" />} title={t("lecturer.home.title")} description={t("lecturer.home.lead")}>
              <Button variant="primary" icon={<Icons.ArrowUpRight className="size-3.5" />} onClick={() => open(EDUNEX_WEB)}>
                {t("lecturer.home.openEdunex")}
              </Button>
            </EmptyState>
          </Page>
        </PanelBoundary>
      </main>
      {settingsOpen && (
        <Suspense fallback={null}>
          <SettingsDialog open onOpenChange={setSettingsOpen} />
        </Suspense>
      )}
    </div>
  );
}
