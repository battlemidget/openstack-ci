/* global it describe before */
"use strict";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
import _ from "lodash";
import OpenstackCI from "../";

describe("Single Installer Test Runner", () =>{
    let ci = new OpenstackCI();
    let jsonOut;
    before(() =>{
        jsonOut = ci.juju.singleStatus();
        ci.authenticate();

    });
    it("should pass on juju status", () => {
        expect(jsonOut.services).to.exist;
    });
    it("should have 4 started machines", () => {
        for (let i = 0; i < 4; i++){
            expect(jsonOut.machines[i]["agent-state"]).to.equal("started");
        }
    });
    it("should contain all default services", () => {
        _.filter(ci.knownServices, svc => {
            expect(jsonOut.services[svc]).to.exist;
        });
    });
    it("should contain all default started services", () => {
        _.filter(ci.knownServices, svc => {
            expect(jsonOut.services[svc].units[`${svc}/0`]["agent-state"]).to.equal("started");
        });
    });
    it("should return a glance api endpoint", () =>{
        expect(ci.getEndPoint("compute")).to.be.fulfilled;
    });
    it("should have glance images", (done) => {
        ci.getEndPoint("compute").then(url => {
            return ci.query(url, "images");
        }).then(result => {
            expect(result.images).to.not.be.empty;
        }).then(done, done);
    });
    it("should return a neutron api endpoint", () =>{
        expect(ci.getEndPoint("network")).to.be.fulfilled;
    });
    it("should have our ubuntu-net network defined", (done) => {
        ci.getEndPoint("network").then(url => {
            return ci.query(url, "v2.0/networks");
        }).then(result => {
            let name = _.result(_.find(result.networks, {"name": "ubuntu-net"}), "name");
            expect(name).to.equal("ubuntu-net");
        }).then(done, done);
    });
});
