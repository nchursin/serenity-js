# all
# @serenity-js
# @integration
# @documentation
# @examples
BOOTSTRAP_SCOPE=all

# all
# cucumber
# jasmine
# mocha
# protractor
# webdriverio
# saucelabs
INTEGRATION_SCOPE=all

# all
# @serenity-js
# @documentation
SITE_SCOPE=all

.PHONY: all install clean lint test compile integration-test verify report site
all: install clean compile

reinstall:
	npm install
	npm run lerna:bootstrap:all

install:
	npm ci
	npm run lerna:bootstrap:$(BOOTSTRAP_SCOPE)

clean:
	npm run clean

lint:
	npm run lint

test:
	npm test

compile:
	npm run compile

integration-test:
	npm run integration-test:$(INTEGRATION_SCOPE)

verify: lint compile test integration-test

report:
	npm run report

site:
	npm run site:$(SITE_SCOPE)
