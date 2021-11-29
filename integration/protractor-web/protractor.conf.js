const { TestRunnerTagger } = require('@integration/testing-tools');
const { ArtifactArchiver } = require('@serenity-js/core');
const { ConsoleReporter } = require('@serenity-js/console-reporter');
const { Photographer, TakePhotosOfFailures } = require('@serenity-js/web');
const { SerenityBDDReporter } = require('@serenity-js/serenity-bdd');
const { Actors } = require('./src/Actors');

const port = process.env.PORT || 8080;

exports.config = {

    baseUrl: `http://localhost:${port}`,

    SELENIUM_PROMISE_MANAGER: false,

    onPrepare: function () {
        return require('protractor').browser.waitForAngularEnabled(false);
    },

    allScriptsTimeout: 120_000,

    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    serenity: {
        actors: new Actors(),
        runner: 'mocha',
        crew: [
            new TestRunnerTagger('protractor'),
            ArtifactArchiver.storingArtifactsAt(`${ process.cwd() }/target/site/serenity`),
            // Photographer.whoWill(TakePhotosOfInteractions),
            Photographer.whoWill(TakePhotosOfFailures),
            new SerenityBDDReporter(),
            // ConsoleReporter.withDefaultColourSupport(),
        ]
    },

    specs: [
        './node_modules/@integration/web-specs/spec/**/*.spec.ts'
    ],

    mochaOpts: {
        timeout: 60_000,
        require: [
            'ts-node/register',
        ],
    },

    chromeDriver: require(`chromedriver`).path,
    directConnect: true,

    capabilities: {
        browserName: 'chrome',
        acceptInsecureCerts: true,

        loggingPrefs: {
            browser: 'INFO',
        },

        'goog:chromeOptions': {
            // As of version 75, ChromeDriver is W3C by default, which Protractor does not fully support.
            w3c: false,
            args: [
                '--disable-web-security',
                '--allow-file-access-from-files',
                '--allow-file-access',
                '--disable-infobars',
                '--headless',
                '--disable-gpu',
                '--window-size=1024x768',
            ],
        },
    },
};
