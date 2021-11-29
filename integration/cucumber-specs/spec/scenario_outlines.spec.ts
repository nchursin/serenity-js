import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { SceneFinished, SceneFinishes, SceneParametersDetected, SceneSequenceDetected, SceneStarts } from '@serenity-js/core/lib/events';
import { Category, Description, Name } from '@serenity-js/core/lib/model';

import { cucumber, cucumberVersion } from '../src';

describe(`@serenity-js/cucumber with Cucumber ${ cucumberVersion() }`, function () {

    it('recognises scenario outlines as sequences of scenes', () =>
        cucumber('features/scenario_outlines.feature', 'common.steps.ts')
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(res => {
                expect(res.exitCode).to.equal(1);

                const
                    expectedScenarioName = new Name('Sample outline'),
                    expectedScenarioCategory = new Category('Serenity/JS recognises scenario outlines'),
                    outlineLine = 3,
                    firstScenarioLine = 12,
                    secondScenarioLine = 13,
                    thirdScenarioLine = 18,
                    expectedExamplesName = new Name('Example results'),
                    expectedExamplesDescription = new Description('Description of the examples');

                PickEvent.from(res.events)
                    .next(SceneSequenceDetected, event => {
                        expect(event.details.name).to.equal(expectedScenarioName);
                        expect(event.details.category).to.equal(expectedScenarioCategory);
                        expect(event.details.location.line).to.equal(outlineLine);
                    })
                    .next(SceneParametersDetected, event => {
                        expect(event.details.name).to.equal(expectedScenarioName);
                        expect(event.details.category).to.equal(expectedScenarioCategory);
                        expect(event.parameters.name).to.equal(expectedExamplesName);
                        expect(event.parameters.description).to.equal(expectedExamplesDescription);
                        expect(event.parameters.values).to.deep.equal({ result: 'passes' });
                    })
                    .next(SceneStarts, event => {
                        expect(event.details.name).to.equal(expectedScenarioName);
                        expect(event.details.category).to.equal(expectedScenarioCategory);
                        expect(event.details.location.line).to.equal(firstScenarioLine);
                    })
                    .next(SceneFinishes, event => {
                        expect(event.details.name).to.equal(expectedScenarioName);
                        expect(event.details.category).to.equal(expectedScenarioCategory);
                        expect(event.details.location.line).to.equal(firstScenarioLine);
                    })
                    .next(SceneFinished, event => {
                        expect(event.details.name).to.equal(expectedScenarioName);
                        expect(event.details.category).to.equal(expectedScenarioCategory);
                        expect(event.details.location.line).to.equal(firstScenarioLine);
                    })
                    .next(SceneSequenceDetected, event => {
                        expect(event.details.name).to.equal(expectedScenarioName);
                        expect(event.details.category).to.equal(expectedScenarioCategory);
                        expect(event.details.location.line).to.equal(outlineLine);
                    })
                    .next(SceneParametersDetected, event => {
                        expect(event.details.name).to.equal(expectedScenarioName);
                        expect(event.details.category).to.equal(expectedScenarioCategory);
                        expect(event.parameters.name).to.equal(expectedExamplesName);
                        expect(event.parameters.description).to.equal(expectedExamplesDescription);
                        expect(event.parameters.values).to.deep.equal({ result: 'fails with a generic error' });
                    })
                    .next(SceneStarts, event => {
                        expect(event.details.name).to.equal(expectedScenarioName);
                        expect(event.details.category).to.equal(expectedScenarioCategory);
                        expect(event.details.location.line).to.equal(secondScenarioLine);
                    })
                    .next(SceneFinishes, event => {
                        expect(event.details.name).to.equal(expectedScenarioName);
                        expect(event.details.category).to.equal(expectedScenarioCategory);
                        expect(event.details.location.line).to.equal(secondScenarioLine);
                    })
                    .next(SceneFinished, event => {
                        expect(event.details.name).to.equal(expectedScenarioName);
                        expect(event.details.category).to.equal(expectedScenarioCategory);
                        expect(event.details.location.line).to.equal(secondScenarioLine);
                    })
                    .next(SceneSequenceDetected, event => {
                        expect(event.details.name).to.equal(expectedScenarioName);
                        expect(event.details.category).to.equal(expectedScenarioCategory);
                        expect(event.details.location.line).to.equal(outlineLine);
                    })
                    .next(SceneParametersDetected, event => {
                        expect(event.details.name).to.equal(expectedScenarioName);
                        expect(event.details.category).to.equal(expectedScenarioCategory);
                        expect(event.parameters.name.value).to.equal('');
                        expect(event.parameters.description.value).to.equal('');
                        expect(event.parameters.values).to.deep.equal({ result: 'passes' });
                    })
                    .next(SceneStarts, event => {
                        expect(event.details.name).to.equal(expectedScenarioName);
                        expect(event.details.category).to.equal(expectedScenarioCategory);
                        expect(event.details.location.line).to.equal(thirdScenarioLine);
                    })
                    .next(SceneFinishes, event => {
                        expect(event.details.name).to.equal(expectedScenarioName);
                        expect(event.details.category).to.equal(expectedScenarioCategory);
                        expect(event.details.location.line).to.equal(thirdScenarioLine);
                    })
                    .next(SceneFinished, event => {
                        expect(event.details.name).to.equal(expectedScenarioName);
                        expect(event.details.category).to.equal(expectedScenarioCategory);
                        expect(event.details.location.line).to.equal(thirdScenarioLine);
                    })
                })
            );
});
