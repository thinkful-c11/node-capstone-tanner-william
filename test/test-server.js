const mocha = require('mocha');
const chai = require('chai');
const faker = require('faker');
const mongoose = require('mongoose');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const should = chai.should();

describe('It should start', function(){

 it('when numbers equal 2', function(){
    const two = 1+1;
    two.should.equal(2);
  });

});