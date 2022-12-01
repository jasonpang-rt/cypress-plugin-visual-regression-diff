import "./commands";
export declare const generateOverlayTemplate: ({ title, imgNewBase64, imgOldBase64, imgDiffBase64, wasImageNotUpdatedYet, error, }: {
    title: string;
    imgNewBase64: string;
    imgOldBase64: string;
    imgDiffBase64: string;
    wasImageNotUpdatedYet: boolean;
    error: boolean;
}) => string;
