import versionUpdate, { VersionUpgrade } from "../utils/versionUpdate";
import { getPackageJson, setPackageJson } from "../utils/files";
import Git from "../utils/github";
import colors from "../styles/colors";
export default async function Version(args: any) {
	const mode = args.update || "patch";
	const msg = args.msg;
	try {
		const e: any = await Git.countStash();
		if (e[0]) {
			const packageJson = JSON.parse(getPackageJson());
			const newVersion = versionUpdate(packageJson.version, mode) as string;
			setPackageJson(JSON.stringify({ ...packageJson, version: newVersion }, null, 4));
			const tagVersion = `v${newVersion}`;
			const message = !!msg ? `${msg} - ${newVersion}` : `Update to: ${tagVersion}`;
			if (Git.isGitRepo()) {
				console.log(colors.warn("Upgrade"), `Upgrade from ${packageJson.version} to ${newVersion}`);
				await Git.add();
				console.log(colors.success("Add"), "Add Package.json");
				await Git.commit(message);
				console.log(colors.success("Commit"), message);
				await Git.tag(tagVersion);
				console.log(colors.success("Tag"), "Generate tag:", tagVersion);
				await Git.push(tagVersion);
				console.log(colors.success("Done"));
			}
		} else {
			console.log(colors.danger("WARN"), "Commit the stashed files");
		}
	} catch (error) {
		console.log(colors.danger("ERRO"), error);
	}
}
