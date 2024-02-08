// test.js

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('./index');

const expect = chai.expect;
chai.use(chaiHttp);

describe('API Tests', () => {
  it('should return Hello, API!', (done) => {
    chai
      .request(app)
      .get('/')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body.message).to.equal('Hello, API!');
        done();
      });
  });
});
