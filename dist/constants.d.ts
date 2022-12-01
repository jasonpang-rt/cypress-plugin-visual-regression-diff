export declare const LINK_PREFIX: string;
export declare const OVERLAY_CLASS: string;
export declare const IMAGE_SNAPSHOT_PREFIX: string;
export declare enum FILE_SUFFIX {
    diff = ".diff",
    actual = ".actual"
}
export declare const TASK: {
    getScreenshotPathInfo: string;
    compareImages: string;
    approveImage: string;
    cleanupImages: string;
    doesFileExist: string;
};
export declare const PATH_VARIABLES: {
    readonly specPath: "{spec_path}";
    readonly unixSystemRootPath: "{unix_system_root_path}";
    readonly winSystemRootPath: "{win_system_root_path}";
};
export declare const WINDOWS_LIKE_DRIVE_REGEX: RegExp;
export declare const METADATA_KEY = "FRSOURCE_CPVRD_V";
