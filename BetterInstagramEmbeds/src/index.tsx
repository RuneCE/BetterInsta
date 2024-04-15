import { get, set, SettingsStore } from "enmity/api/settings";
import { FormRow, FormSection, FormSwitch } from "enmity/components";
import { Plugin, registerPlugin } from "enmity/managers/plugins";
import { Messages, React, Toasts } from "enmity/metro/common";
import { create } from "enmity/patcher";
import SettingsPage from "../../common/components/_pluginSettings/settingsPage";
import { Icons } from "../../common/components/_pluginSettings/utils";
import manifest from "../manifest.json";

interface SettingsProps {
    settings: SettingsStore;
}

const Patcher = create(manifest.name);

const BIE: Plugin = {
    ...manifest,
    onStart() {
        try {
            if (!get("_instagram", "_type", false)) set("_instagram", "_type", "instagramez.com");

            Patcher.before(Messages, "sendMessage", (_self, args, _orig) => {
                const content = args[1]["content"];
                const instagramLinks = content.match(/http(s)?:\/\/(\w+.)?instagram.com\/reel\/[a-zA-Z0-9_.-]{8,12}(\/)?/gim);
                if (!instagramLinks) return;
                args[1]["content"] = content.replace(/http(s)?:\/\/(\w+.)?instagram.com/gim, `https://${get("_instagram", "_type", false)}`);
            });
        } catch (err) {
            console.log("[ BetterInstagramEmbeds Error ]", err);
        }
    },
    onStop() {
        Patcher.unpatchAll();
    },
    patches: [],
    getSettingsPanel({ settings }: SettingsProps) {
        return <SettingsPage manifest={manifest} settings={settings} hasToasts={false} commands={null}>
            <FormSection title="Plugin Settings">
                <FormRow
                    label="Use ddinstagram.com instead of instagramez.com"
                    leading={<FormRow.Icon source={Icons.Copy} />}
                    trailing={
                        <FormSwitch
                            value={settings.getBoolean("_insta", false)}
                            onValueChange={() => {
                                try {
                                    settings.toggle("_insta", false);
                                    if (settings.getBoolean("_insta", false)) {
                                        set("_instagram", "_type", "ddinstagram.com");
                                    } else {
                                        set("_instagram", "_type", "instagramez.com");
                                    }
                                    Toasts.open({
                                        content: `Switched to ${get("_instagram", "_type", false)}.`,
                                        source: Icons.Success,
                                    });
                                } catch (err) {
                                    console.log("[ BetterInstagramEmbeds Error ]", err);

                                    Toasts.open({
                                        content: "An error has occurred. Check debug logs for more info.",
                                        source: Icons.Failed,
                                    });
                                }
                            }}
                        />
                    }
                />
            </FormSection>
        </SettingsPage>
    },
};

registerPlugin(BIE);
