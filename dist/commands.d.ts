/// <reference types="cypress" />
import type pixelmatch from "pixelmatch";
declare global {
    namespace Cypress {
        type MatchImageOptions = {
            screenshotConfig?: Partial<Cypress.ScreenshotDefaultsOptions>;
            diffConfig?: Parameters<typeof pixelmatch>[5];
            updateImages?: boolean;
            /**
             * @deprecated since version 3.0, use imagesPath instead
             */
            imagesDir?: string;
            imagesPath?: string;
            maxDiffThreshold?: number;
            title?: string;
            matchAgainstPath?: string;
        };
        type MatchImageReturn = {
            diffValue: number | undefined;
            imgNewPath: string;
            imgPath: string;
            imgDiffPath: string;
            imgNewBase64: string | undefined;
            imgBase64: string | undefined;
            imgDiffBase64: string | undefined;
            imgNew: InstanceType<Cypress["Buffer"]> | undefined;
            img: InstanceType<Cypress["Buffer"]> | undefined;
            imgDiff: InstanceType<Cypress["Buffer"]> | undefined;
        };
        interface Chainable<Subject> {
            /**
             * Command to create and compare image snapshots.
             * @memberof Cypress.Chainable
             * @example cy.get('.my-element').matchImage();
             */
            matchImage(options?: Cypress.MatchImageOptions): Chainable<MatchImageReturn>;
        }
    }
}
export declare const getConfig: (options: Cypress.MatchImageOptions) => {
    scaleFactor: number;
    updateImages: boolean;
    imagesPath: string;
    maxDiffThreshold: number;
    diffConfig: pixelmatch.PixelmatchOptions;
    screenshotConfig: Partial<Cypress.ScreenshotDefaultsOptions>;
    matchAgainstPath: string | undefined;
};
