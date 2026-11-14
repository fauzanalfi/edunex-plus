// Shell dosen (Phase A): over the student tabs while a lecturer is signed in.
import { useState } from "react";
import { View } from "react-native";
import { errorKey } from "../../../src/app/bridge";
import { useOpenExternal } from "../../../src/app/hooks";
import { useT } from "../../../src/app/i18n";
import { displayName } from "../../../src/app/names";
import { useBridge, useDataset } from "../../../src/app/store";
import { EDUNEX_WEB } from "../../../src/core/links";
import { toast } from "../swaps/overlays";
import { Button } from "../ui/controls";
import { EmptyState } from "../ui/display";
import { Icons } from "../ui/icons";
import { Page, PageHeader } from "../ui/layout";
import { useTheme } from "../ui/theme";

/** Full-screen shell while Edunex is a lecturer account: student tabs stay underneath, unused. */
export function LecturerShell() {
  const t = useT();
  const theme = useTheme();
  const account = useDataset("edunex.account");
  const bridge = useBridge();
  const open = useOpenExternal();
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
    <View testID="screen.lecturer" style={{ flex: 1, backgroundColor: theme.color.surface }}>
      <Page>
        <PageHeader eyebrow={t("lecturer.role")} title={name} />
        <EmptyState icon={<Icons.BookOpen size={28} color={theme.color.muted} />} title={t("lecturer.home.title")} description={t("lecturer.home.lead")}>
          <View style={{ gap: 8, alignItems: "center" }}>
            <Button variant="primary" onPress={() => open(EDUNEX_WEB)} testID="action.openEdunex">
              {t("lecturer.home.openEdunex")}
            </Button>
            <Button variant="secondary" busy={signingOut} onPress={() => void signOut()} testID="action.signOut">
              {t("action.signOut")}
            </Button>
          </View>
        </EmptyState>
      </Page>
    </View>
  );
}
