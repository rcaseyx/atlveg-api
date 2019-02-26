const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');

const { app, runServer, closeServer } = require('../server');
const {TEST_DATABASE_URL} = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

function seedData() {
    console.info('Seeding test data');

    const seedData = [];

    // code for seeding data
}

function tearDownDb() {
    console.warn('Deleting test database');
    return mongoose.connection.db.dropDatabase();
}

describe('ATL Veg API', function() {
    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    before(function() {
        return seedData();
    });

    after(function() {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    });

    describe('GET endpoints', function() {
        it('should return data', function() {
            let res;
            return chai.request(app)
              .get('/')
              .then(function(_res) {
                  res = _res;
                  expect(res).to.have.status(200);
              });
        });
    });
});
