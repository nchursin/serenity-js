/* eslint-disable unicorn/filename-case */
import 'mocha';

import { expect } from '@integration/testing-tools';
import { Cast, Clock, Duration, Stage, StageManager } from '@serenity-js/core';
import { RemoteCapability } from '@wdio/types/build/Capabilities';
import { given } from 'mocha-testdata';

import { WebdriverIOConfig } from '../../src';
import { WebdriverIONotifier } from '../../src/adapter/WebdriverIONotifier';
import {
    cid,
    executionCompromised,
    executionFailedWithAssertionError,
    executionFailedWithError,
    executionIgnored,
    executionSkipped,
    executionSuccessful,
    implementationPending,
    retryableSceneDetected,
    retryableSceneFinishedWith,
    retryableSceneStarts,
    scene1FinishedWith,
    scene1Id,
    scene1Starts,
    scene2FinishedWith,
    scene2Starts,
    successThreshold,
    testRunFinished,
    testRunFinishes,
    testRunStarts,
    testSuiteFinished,
    testSuiteStarts,
    when,
} from './fixtures';
import EventEmitter = require('events');
import sinon = require('sinon');
import { Suite, Test, TestResult } from '@wdio/types/build/Frameworks';

describe('WebdriverIONotifier', () => {

    const capabilities: RemoteCapability = {
        browserName: 'chrome',
    };

    const specs = [
        '/users/jan/project/feature.spec.ts'
    ];

    const configSandbox = sinon.createSandbox();

    let config: Partial<WebdriverIOConfig> & {
        beforeSuite:    sinon.SinonSpy<[suite: Suite], void>,
        beforeTest:     sinon.SinonSpy<[test: Test, context: any], void>,
        afterTest:      sinon.SinonSpy<[test: Test, context: any, result: TestResult], void>,
        afterSuite:     sinon.SinonSpy<[suite: Suite], void>,
    }

    let notifier: WebdriverIONotifier,
        reporter: sinon.SinonStubbedInstance<EventEmitter>,
        stage: Stage;

    beforeEach(() => {

        config = {
            beforeSuite:    configSandbox.spy() as sinon.SinonSpy<[suite: Suite], void>,
            beforeTest:     configSandbox.spy() as sinon.SinonSpy<[test: Test, context: any], void>,
            afterTest:      configSandbox.spy() as sinon.SinonSpy<[test: Test, context: any, result: TestResult], void>,
            afterSuite:     configSandbox.spy() as sinon.SinonSpy<[suite: Suite], void>,
        }

        reporter = sinon.createStubInstance(EventEmitter);

        stage = new Stage(
            Cast.whereEveryoneCan(/* do nothing much */),
            new StageManager(Duration.ofMilliseconds(250), new Clock())
        );

        notifier = new WebdriverIONotifier(
            config as WebdriverIOConfig,
            capabilities,
            reporter,
            successThreshold,
            cid,
            specs
        );

        stage.assign(notifier);
        notifier.assignedTo(stage);
    });

    afterEach(() => {
        configSandbox.reset();
    });

    describe('failureCount()', () => {

        given([{
            description: 'no scenarios',
            expectedFailureCount: 0,
            events: []
        }, {
            description: 'all successful',
            expectedFailureCount: 0,
            events: [
                scene1Starts,
                scene1FinishedWith(executionSuccessful)
            ]
        }, {
            description: 'one failure',
            expectedFailureCount: 1,
            events: [
                scene1Starts,
                scene1FinishedWith(executionFailedWithError)
            ]
        }, {
            description: 'two failures',
            expectedFailureCount: 2,
            events: [
                scene1Starts,
                scene1FinishedWith(executionFailedWithError),
                scene2Starts,
                scene2FinishedWith(executionFailedWithError)
            ]
        }, {
            description: 'failure and success',
            expectedFailureCount: 1,
            events: [
                scene1Starts,
                scene1FinishedWith(executionSuccessful),
                scene2Starts,
                scene2FinishedWith(executionFailedWithError)
            ]
        }]).it('returns the number of scenarios that failed', ({ events, expectedFailureCount }) => {
            when(notifier).receives(
                testRunStarts,
                ...events,
                testRunFinishes,
                testRunFinished,
            );

            expect(notifier.failureCount()).to.equal(expectedFailureCount);
        });

        given([
            { description: 'successful',        expectedFailureCount: 0, outcome: executionSuccessful },
            { description: 'skipped',           expectedFailureCount: 0, outcome: executionSkipped },
            { description: 'ignored',           expectedFailureCount: 0, outcome: executionIgnored },
            { description: 'pending',           expectedFailureCount: 1, outcome: implementationPending },
            { description: 'assertion failure', expectedFailureCount: 1, outcome: executionFailedWithAssertionError },
            { description: 'error',             expectedFailureCount: 1, outcome: executionFailedWithError },
            { description: 'compromised',       expectedFailureCount: 1, outcome: executionCompromised },
        ]).it('counts results above the success threshold as successful', ({ expectedFailureCount, outcome }) => {
            when(notifier).receives(
                testRunStarts,
                scene1Starts,
                scene1FinishedWith(outcome),
                testRunFinishes,
                testRunFinished,
            );

            expect(notifier.failureCount()).to.equal(expectedFailureCount);
        });

        it('does not count retried scenarios', () => {
            when(notifier).receives(
                testRunStarts,
                retryableSceneStarts(0),
                retryableSceneDetected(0),
                retryableSceneFinishedWith(0, executionIgnored),

                retryableSceneStarts(1),
                retryableSceneDetected(1),
                retryableSceneFinishedWith(1, executionIgnored),

                retryableSceneStarts(2),
                retryableSceneDetected(2),
                retryableSceneFinishedWith(2, executionSuccessful),

                testRunFinishes,
                testRunFinished,
            );

            expect(notifier.failureCount()).to.equal(0);
        });
    });

    describe('notifications', () => {

        it('emits events when a test suite starts and is finished', () => {
            when(notifier).receives(
                testRunStarts,
                testSuiteStarts(0, 'Checkout'),
                testSuiteFinished(0, 'Checkout', executionSuccessful),
                testRunFinishes,
                testRunFinished,
            );

            expect(reporter.emit.getCalls().map(_ => _.args)).to.deep.equal([
                [
                    'suite:start',
                    {
                        type: 'suite:start',
                        uid: 'suite-0',
                        cid,
                        title: 'Checkout',
                        fullTitle: 'Checkout',
                        parent: '',
                        file: 'payments/checkout.feature',
                        specs,
                        pending: false
                    }
                ],
                [
                    'suite:end',
                    {
                        type: 'suite:end',
                        uid: 'suite-0',
                        cid,
                        title: 'Checkout',
                        fullTitle: 'Checkout',
                        parent: '',
                        file: 'payments/checkout.feature',
                        specs,
                        pending: false,
                        duration: 500
                    }
                ]
            ])
        });

        it('emits events when a nested test suite starts and is finished', () => {
            when(notifier).receives(
                testRunStarts,
                testSuiteStarts(0, 'Checkout'),
                testSuiteStarts(1, 'Credit card payment'),
                testSuiteFinished(1, 'Credit card payment', executionSuccessful),
                testSuiteFinished(0, 'Checkout', executionSuccessful),
                testRunFinishes,
                testRunFinished,
            );

            expect(reporter.emit.getCalls().map(_ => _.args)).to.deep.equal([
                [
                    'suite:start',
                    {
                        type: 'suite:start',
                        uid: 'suite-0',
                        cid,
                        title: 'Checkout',
                        fullTitle: 'Checkout',
                        parent: '',
                        file: 'payments/checkout.feature',
                        specs,
                        pending: false
                    }
                ],
                [
                    'suite:start',
                    {
                        type: 'suite:start',
                        uid: 'suite-1',
                        cid,
                        title: 'Credit card payment',
                        fullTitle: 'Checkout Credit card payment',
                        parent: 'Checkout',
                        file: 'payments/checkout.feature',
                        specs,
                        pending: false
                    }
                ],
                [
                    'suite:end',
                    {
                        type: 'suite:end',
                        uid: 'suite-1',
                        cid,
                        title: 'Credit card payment',
                        fullTitle: 'Checkout Credit card payment',
                        parent: 'Checkout',
                        file: 'payments/checkout.feature',
                        specs,
                        pending: false,
                        duration: 500
                    }
                ],
                [
                    'suite:end',
                    {
                        type: 'suite:end',
                        uid: 'suite-0',
                        cid,
                        title: 'Checkout',
                        fullTitle: 'Checkout',
                        parent: '',
                        file: 'payments/checkout.feature',
                        specs,
                        pending: false,
                        duration: 500
                    }
                ]
            ]);
        });

        it('emits events when a nested test starts and is finished', () => {
            when(notifier).receives(
                testRunStarts,
                testSuiteStarts(0, 'Checkout'),
                testSuiteStarts(1, 'Credit card payment'),
                scene1Starts,
                scene1FinishedWith(executionSuccessful),
                testSuiteFinished(1, 'Credit card payment', executionSuccessful),
                testSuiteFinished(0, 'Checkout', executionSuccessful),
                testRunFinishes,
                testRunFinished,
            );

            expect(reporter.emit.getCalls().map(_ => _.args)).to.deep.equal([
                [
                    'suite:start',
                    {
                        type: 'suite:start',
                        uid: 'suite-0',
                        cid,
                        title: 'Checkout',
                        fullTitle: 'Checkout',
                        parent: '',
                        file: 'payments/checkout.feature',
                        specs,
                        pending: false
                    }
                ],
                [
                    'suite:start',
                    {
                        type: 'suite:start',
                        uid: 'suite-1',
                        cid,
                        title: 'Credit card payment',
                        fullTitle: 'Checkout Credit card payment',
                        parent: 'Checkout',
                        file: 'payments/checkout.feature',
                        specs,
                        pending: false
                    }
                ],

                [
                    'test:start',
                    {
                        cid,
                        file: 'payments/checkout.feature',
                        fullTitle: 'Checkout Credit card payment Paying with a default card',
                        parent: 'Credit card payment',
                        pending: false,
                        'specs': [
                            '/users/jan/project/feature.spec.ts',
                        ],
                        title: 'Paying with a default card',
                        type: 'test:start',
                        uid: scene1Id.value,
                    }
                ],
                [
                    'test:pass',
                    {
                        cid,
                        duration: 500,
                        file: 'payments/checkout.feature',
                        fullTitle: 'Checkout Credit card payment Paying with a default card',
                        parent: 'Credit card payment',
                        pending: false,
                        'specs': [
                            '/users/jan/project/feature.spec.ts',
                        ],
                        title: 'Paying with a default card',
                        type: 'test:pass',
                        uid: scene1Id.value,
                    }
                ],
                [
                    'test:end',
                    {
                        cid,
                        duration: 500,
                        file: 'payments/checkout.feature',
                        fullTitle: 'Checkout Credit card payment Paying with a default card',
                        parent: 'Credit card payment',
                        pending: false,
                        'specs': [
                            '/users/jan/project/feature.spec.ts',
                        ],
                        title: 'Paying with a default card',
                        type: 'test:end',
                        uid: scene1Id.value,
                    }
                ],

                [
                    'suite:end',
                    {
                        type: 'suite:end',
                        uid: 'suite-1',
                        cid,
                        title: 'Credit card payment',
                        fullTitle: 'Checkout Credit card payment',
                        parent: 'Checkout',
                        file: 'payments/checkout.feature',
                        specs,
                        pending: false,
                        duration: 500
                    }
                ],
                [
                    'suite:end',
                    {
                        type: 'suite:end',
                        uid: 'suite-0',
                        cid,
                        title: 'Checkout',
                        fullTitle: 'Checkout',
                        parent: '',
                        file: 'payments/checkout.feature',
                        specs,
                        pending: false,
                        duration: 500
                    }
                ]
            ]);
        })
    });

    describe('hooks', () => {

        describe('when scenario is successful', () => {

            beforeEach(() => {
                when(notifier).receives(
                    testRunStarts,
                    testSuiteStarts(0, 'Checkout'),
                    testSuiteStarts(1, 'Credit card payment'),
                    scene1Starts,
                    scene1FinishedWith(executionSuccessful),
                    testSuiteFinished(1, 'Credit card payment', executionSuccessful),
                    testSuiteFinished(0, 'Checkout', executionSuccessful),
                    testRunFinishes,
                    testRunFinished,
                );
            });

            it('invokes beforeSuite when TestSuiteStarts', () => {

                expect(config.beforeSuite.getCalls().map(_ => _.args)).to.deep.equal([[{
                    type: 'suite:start',
                    uid: 'suite-0',
                    cid: '0-0',
                    title: 'Checkout',
                    fullTitle: 'Checkout',
                    parent: '',
                    file: 'payments/checkout.feature',
                    specs: [ '/users/jan/project/feature.spec.ts' ],
                    pending: false
                }], [{
                    type: 'suite:start',
                    uid: 'suite-1',
                    cid,
                    title: 'Credit card payment',
                    fullTitle: 'Checkout Credit card payment',
                    parent: 'Checkout',
                    file: 'payments/checkout.feature',
                    specs,
                    pending: false
                }]]);
            });

            it('invokes afterSuite when TestSuiteFinished', () => {

                expect(config.afterSuite.getCalls().map(_ => _.args)).to.deep.equal([[{
                    type: 'suite:end',
                    uid: 'suite-1',
                    cid,
                    title: 'Credit card payment',
                    fullTitle: 'Checkout Credit card payment',
                    parent: 'Checkout',
                    file: 'payments/checkout.feature',
                    specs,
                    pending: false,
                    duration: 500
                }], [{
                    type: 'suite:end',
                    uid: 'suite-0',
                    cid,
                    title: 'Checkout',
                    fullTitle: 'Checkout',
                    parent: '',
                    file: 'payments/checkout.feature',
                    specs,
                    pending: false,
                    duration: 500
                }]]);
            });

            it('invokes beforeTest when SceneStarts', () => {
                const expectedContext = {};

                expect(config.beforeTest.getCalls().map(_ => _.args)).to.deep.equal([
                    [
                        {
                            ctx:        expectedContext,
                            file:       'payments/checkout.feature',
                            fullName:   'Checkout Credit card payment Paying with a default card',
                            fullTitle:  'Checkout Credit card payment Paying with a default card',
                            parent:     'Credit card payment',
                            pending:    false,
                            title:      'Paying with a default card',
                            type:       'test',
                        },
                        expectedContext,
                    ],
                ]);
            });

            it('invokes afterTest when SceneFinished with success', () => {
                const expectedContext = {};
                const expectedResult: TestResult = {
                    passed: true,
                    duration: 500,
                    retries: {
                        limit: 0,
                        attempts: 0,
                    },
                    exception: '',
                    status: 'passed',
                };

                expect(config.afterTest.getCalls().map(_ => _.args)).to.deep.equal([
                    [
                        {
                            ctx: {},
                            file: 'payments/checkout.feature',
                            fullName: 'Checkout Credit card payment Paying with a default card',
                            fullTitle: 'Checkout Credit card payment Paying with a default card',
                            parent: 'Credit card payment',
                            pending: false,
                            title: 'Paying with a default card',
                            type: 'test',
                        },
                        expectedContext,
                        expectedResult
                    ],
                ]);
            });
        });

        describe('when scenario is not successful', () => {

            it('invokes afterTest when SceneFinished with assertion error', () => {

                when(notifier).receives(
                    testRunStarts,
                    testSuiteStarts(0, 'Checkout'),
                    testSuiteStarts(1, 'Credit card payment'),
                    scene1Starts,
                    scene1FinishedWith(executionFailedWithAssertionError),
                    testSuiteFinished(1, 'Credit card payment', executionFailedWithAssertionError),
                    testSuiteFinished(0, 'Checkout', executionFailedWithAssertionError),
                    testRunFinishes,
                    testRunFinished,
                );

                const expectedContext = {};

                const [ test, context, result ] = config.afterTest.getCall(0).args;

                expect(test).to.deep.equal({
                    ctx: expectedContext,
                    file: 'payments/checkout.feature',
                    fullName: 'Checkout Credit card payment Paying with a default card',
                    fullTitle: 'Checkout Credit card payment Paying with a default card',
                    parent: 'Credit card payment',
                    pending: false,
                    title: 'Paying with a default card',
                    type: 'test',
                });

                expect(context).to.deep.equal(expectedContext);
                expect(result.duration).to.equal(500);
                expect(result.exception).to.equal('Expected false to be true');
                expect(result.passed).to.equal(false);
                expect(result.status).to.equal('failed');
                expect(result.retries).to.deep.equal({ attempts: 0, limit: 0 });
                expect(result.error.actual).to.equal(false);
                expect(result.error.expected).to.equal(true);
                expect(result.error.message).to.equal('Expected false to be true');
                expect(result.error.name).to.equal('AssertionError');
                expect(result.error.type).to.equal('AssertionError');
                expect(result.error.stack).to.match(/^AssertionError: Expected false to be true/);
            });
        });

        it('notifies of async operations...');
    });
})
