import { Stage } from '@serenity-js/core';
import { ActivityFinished, ActivityRelatedArtifactGenerated, ActivityStarts, AsyncOperationAttempted, AsyncOperationCompleted, AsyncOperationFailed, DomainEvent } from '@serenity-js/core/lib/events';
import { CorrelationId, Description, Name, Photo } from '@serenity-js/core/lib/model';

import { BrowseTheWeb } from '../../../../screenplay';

/**
 * @desc
 *  Configures the {@link Photographer} to take photos (a.k.a. screenshots)
 *  of the {@link @serenity-js/core/lib/screenplay~Activity} performed
 *  by the {@link @serenity-js/core/lib/screenplay/actor~Actor} in the spotlight
 *  under specific conditions.
 *
 * @abstract
 */
export abstract class PhotoTakingStrategy {

    /**
     * @desc
     *  Takes a photo of the web browser held by the {@link @serenity-js/core/lib/screenplay/actor~Actor} in the spotlight.
     *
     * @param {@serenity-js/core/lib/events~ActivityStarts | @serenity-js/core/lib/events~ActivityFinished} event
     * @param {@serenity-js/core/lib/stage~Stage} stage - the Stage that holds reference to the Actor in the spotlight
     * @returns {void}
     *
     * @see {@link @serenity-js/core/lib/stage~Stage#theActorInTheSpotlight}
     */
    async considerTakingPhoto(event: ActivityStarts | ActivityFinished, stage: Stage): Promise<void> {
        if (! this.shouldTakeAPhotoOf(event)) {
            return void 0;
        }

        let browseTheWeb: BrowseTheWeb;

        try {
            browseTheWeb = BrowseTheWeb.as(stage.theActorInTheSpotlight());
        } catch {
            // actor doesn't have a browser, abort
            return void 0;
        }

        const
            id              = CorrelationId.create(),
            nameSuffix      = this.photoNameFor(event);

        stage.announce(new AsyncOperationAttempted(
            new Description(`[Photographer:${ this.constructor.name }] Taking screenshot of '${ nameSuffix }'...`),
            id,
        ));

        let dialogIsPresent: boolean;

        try {
            dialogIsPresent = await browseTheWeb.modalDialog().then(dialog => dialog.isPresent());

            if (dialogIsPresent) {
                return stage.announce(new AsyncOperationCompleted(
                    new Description(`[${ this.constructor.name }] Aborted taking screenshot of '${ nameSuffix }' because of a modal dialog obstructing the view`),
                    id,
                ));
            }
        } catch (error) {
            return stage.announce(new AsyncOperationFailed(error, id));
        }

        try {
            const [ screenshot, capabilities ] = await Promise.all([
                browseTheWeb.takeScreenshot(),
                browseTheWeb.browserCapabilities(),
            ]);

            const
                context   = [ capabilities.platformName, capabilities.browserName, capabilities.browserVersion ],
                photoName = this.combinedNameFrom(...context, nameSuffix);

            stage.announce(new ActivityRelatedArtifactGenerated(
                event.sceneId,
                event.activityId,
                photoName,
                Photo.fromBase64(screenshot),
            ));

            return stage.announce(new AsyncOperationCompleted(
                new Description(`[${ this.constructor.name }] Took screenshot of '${ nameSuffix }' on ${ context }`),
                id,
            ));
        }
        catch (error) {
            if (this.shouldIgnore(error)) {
                stage.announce(new AsyncOperationCompleted(
                    new Description(`[${ this.constructor.name }] Aborted taking screenshot of '${ nameSuffix }' because of ${ error.constructor && error.constructor.name }`),
                    id,
                ));
            }
            else {
                stage.announce(new AsyncOperationFailed(error, id));
            }
        }
    }

    protected abstract shouldTakeAPhotoOf(event: DomainEvent): boolean;

    protected abstract photoNameFor(event: DomainEvent): string;

    private combinedNameFrom(...parts: string[]): Name {
        return new Name(parts.filter(v => !! v).join('-'));
    }

    private shouldIgnore(error: Error) {
        return error.name
            && (error.name === 'NoSuchSessionError');
        // todo: add SauceLabs
        //  [0-0] 2021-12-02T01:32:36.402Z ERROR webdriver: Request failed with status 404 due to no such window: no such window: target window already closed
        //  [0-0] from unknown error: web view not found
    }
}
