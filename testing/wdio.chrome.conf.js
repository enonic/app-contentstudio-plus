const path = require('path')
const { TimelineService } = require('wdio-timeline-reporter/timeline-service');
import {ReportAggregator} from 'wdio-html-nice-reporter';

let reportAggregator;

exports.config = {

    specs: [
        path.join(__dirname, './specs/*.spec.js')
    ],

    maxInstances: 1,

    capabilities: [{
        browserName: 'chrome',
        browserVersion: '115.0.5790.170',
        'goog:chromeOptions': {
            "args": [
                "--headless", "--disable-gpu", "--no-sandbox",
                "--lang=en",
                '--disable-extensions',
                'window-size=1970,1000'
            ]
        }
    }],
    logLevel: 'info',
    //
    // Enables colors for log output.
    coloredLogs: true,

    baseUrl: 'http://localhost:8080/admin/tool',
    //
    // Default timeout for all waitForXXX commands.
    waitforTimeout: 3000,
    //
    // Default timeout in milliseconds for request
    // if Selenium Grid doesn't send response
    connectionRetryTimeout: 160000,
    //
    // Default request retries count
    connectionRetryCount: 3,

    //services: [[TimelineService]],

    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: 120000
    },
    // Set directory to store all logs into
    outputDir: "./build/reports/logs/",

    reporters: ['concise',
        ["html-nice", {
            outputDir: '/build/reports/html-reports/',
            filename: 'report.html',
            reportTitle: 'Test Report Title',
            linkScreenshots: true,
            //to show the report in a browser when done
            showInBrowser: true,
            collapseTests: false,
            //to turn on screenshots after every test
            useOnAfterCommandForScreenshot: false
        }]
    ],

    // Hook that gets executed before the suite starts
    beforeSuite: function (suite) {
        browser.url(this.baseUrl);
    },

    /**
     * Gets executed once before all workers get launched.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     */
    onPrepare: function (config, capabilities) {
        reportAggregator = new ReportAggregator(
          {
              outputDir: '/build/reports/html-reports/',
              filename: process.env.TEST_BROWSER + '-master-report.html',
              reportTitle: 'Micro-Magic Web Test Report',
              browserName: process.env.TEST_BROWSER ? process.env.TEST_BROWSER : 'unspecified',
              showInBrowser: true
          });

        reportAggregator.clean();
    },

    onComplete: function (exitCode, config, capabilities, results) {
        (async () => {
            await reportAggregator.createReport();
        })();
    }
};
