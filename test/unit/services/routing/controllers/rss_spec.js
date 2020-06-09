const should = require('should');
const sinon = require('sinon');
const _ = require('lodash');
const testUtils = require('../../../../utils');
const common = require('../../../../../core/server/lib/common');
const security = require('../../../../../core/server/lib/security');
const settingsCache = require('../../../../../core/server/services/settings/cache');
const controllers = require('../../../../../core/frontend/services/routing/controllers');
const helpers = require('../../../../../core/frontend/services/routing/helpers');
const rssService = require('../../../../../core/frontend/services/rss');

// Helper function to prevent unit tests
// from failing via timeout when they
// should just immediately fail
function failTest(done) {
    return function (err) {
        done(err);
    };
}

describe('Unit - services/routing/controllers/rss', function () {
    let req;
    let res;
    let next;
    let fetchDataStub;
    let posts;

    beforeEach(function () {
        posts = [
            testUtils.DataGenerator.forKnex.createPost(),
            testUtils.DataGenerator.forKnex.createPost()
        ];

        req = {
            params: {},
            originalUrl: '/rss/'
        };

        res = {
            routerOptions: {},
            locals: {
                safeVersion: '0.6'
            }
        };

        next = sinon.stub();
        fetchDataStub = sinon.stub();

        sinon.stub(helpers, 'fetchData').get(function () {
            return fetchDataStub;
        });

        sinon.stub(security.string, 'safe').returns('safe');

        sinon.stub(rssService, 'render');

        sinon.stub(settingsCache, 'get');
        settingsCache.get.withArgs('title').returns('Ghost');
        settingsCache.get.withArgs('description').returns('Ghost is cool!');
    });

    afterEach(function () {
        sinon.restore();
    });

    it('should fetch data and attempt to send XML', function (done) {
        fetchDataStub.withArgs({page: 1, slug: undefined}).resolves({
            posts: posts
        });

        rssService.render.callsFake(function (res, baseUrl, data) {
            baseUrl.should.eql('/rss/');
            data.posts.should.eql(posts);
            data.title.should.eql('Ghost');
            data.description.should.eql('Ghost is cool!');
            done();
        });

        controllers.rss(req, res, failTest(done));
    });
});
