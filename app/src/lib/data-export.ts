import RNFS from "react-native-fs";
import Share from "react-native-share";
import { api } from "./api";
import { createUserDataExportFileName, serializeUserDataExport } from "./data-export-format";

export async function exportUserDataFile() {
  const data = await api.exportMyData();
  const fileName = createUserDataExportFileName();
  const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
  await RNFS.writeFile(path, serializeUserDataExport(data), "utf8");
  await Share.open({
    title: "Lumine 내 기록 내보내기",
    url: `file://${path}`,
    type: "application/json",
    filename: fileName,
    saveToFiles: true,
    failOnCancel: false
  });
  return path;
}
