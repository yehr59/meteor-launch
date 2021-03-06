/* global describe it beforeEach afterEach */

// eslint-disable-next-line
import { assert } from "chai";
import { execSync } from "child_process";
import { resolve } from "path";
import { statSync } from "fs";
import rimraf from "rimraf";
import { version } from "../../package.json";

import util from "../util";

describe("generateSettings", () => {
  beforeEach(() => {
    delete require.cache[
      `${process.cwd()}/launch.json`
    ];
  });
  it("should return a blank object if no launch file", () => {
    const results = util.generateSettings({});
    assert.deepEqual(results, {});
  });
  it("should pass any random env var", () => {
    // eslint-disable-next-line
    execSync(`echo '{"ANDROID_ZIPALIGN": "/nonsense", "WOW": "such"}' > launch.json`);
    const results = util.generateSettings({});
    assert.deepEqual(results.WOW, "such");
  });
  describe("ANDROID_ZIPALIGN", () => {
    beforeEach(() => {
      delete process.env.ANDROID_ZIPALIGN;
      // eslint-disable-next-line
      execSync(`echo '{"ANDROID_ZIPALIGN": "/nonsense"}' > launch.json`);
    });
    it("should pass through absolute zipalign path", () => {
      process.env.ANDROID_ZIPALIGN = "/meow";
      const results = util.generateSettings(process.env);
      assert.equal(results.ANDROID_ZIPALIGN, "/meow");
    });
    it("should resolve home zipalign path", () => {
      process.env.ANDROID_ZIPALIGN = "~/meow";
      const results = util.generateSettings(process.env);
      assert.equal(results.ANDROID_ZIPALIGN, `${process.env.HOME}/meow`);
    });
    it("should resolve relative zipalign path", () => {
      process.env.ANDROID_ZIPALIGN = "../meow";
      const results = util.generateSettings(process.env);
      assert.equal(
        results.ANDROID_ZIPALIGN,
        resolve(
          process.cwd(),
          "../meow",
        ),
      );
    });
  });
  describe("METEOR_INPUT_DIR", () => {
    beforeEach(() => {
      delete require.cache[
        `${process.cwd()}/launch.json`
      ];
    });
    it("should be root directory if doesn't exists", () => {
      // eslint-disable-next-line
      execSync(`echo '{}' > launch.json`);
      const results = util.generateSettings(process.env);
      assert.equal(results.METEOR_INPUT_DIR, process.cwd());
    });
    it("should be root directory if blank", () => {
      // eslint-disable-next-line
      execSync(`echo '{"METEOR_INPUT_DIR": ""}' > launch.json`);
      const results = util.generateSettings(process.env);
      assert.equal(results.METEOR_INPUT_DIR, process.cwd());
    });
    it("should be absolute path to directory if set", () => {
      // eslint-disable-next-line
      execSync(`echo '{"METEOR_INPUT_DIR": "nonsense"}' > launch.json`);
      const results = util.generateSettings(process.env);
      assert.equal(
        results.METEOR_INPUT_DIR,
        resolve(
          process.cwd(),
          "nonsense",
        ),
      );
    });
  });
  describe("METEOR_OUTPUT_DIR", () => {
    beforeEach(() => {
      delete require.cache[
        `${process.cwd()}/launch.json`
      ];
    });
    it("should set as .build if no METEOR_OUTPUT_DIR", () => {
      // eslint-disable-next-line
      execSync(`echo '{}' > launch.json`);
      const results = util.generateSettings(process.env);
      assert.equal(results.METEOR_OUTPUT_DIR, ".build");
    });
    it("should set as .build if blank METEOR_OUTPUT_DIR", () => {
      // eslint-disable-next-line
      execSync(`echo '{"METEOR_OUTPUT_DIR": ""}' > launch.json`);
      const results = util.generateSettings(process.env);
      assert.equal(results.METEOR_OUTPUT_DIR, ".build");
    });
    it("should set METEOR_OUTPUT_DIR if in launch.json", () => {
      // eslint-disable-next-line
      execSync(`echo '{"METEOR_OUTPUT_DIR": "../nonsense"}' > launch.json`);
      const results = util.generateSettings(process.env);
      assert.equal(results.METEOR_OUTPUT_DIR, "../nonsense");
    });
  });
  describe("METEOR_OUTPUT_ABSOLUTE", () => {
    beforeEach(() => {
      delete require.cache[
        `${process.cwd()}/launch.json`
      ];
    });
    it("should set as absolute of .build if no METEOR_OUTPUT_DIR", () => {
      // eslint-disable-next-line
      execSync(`echo '{}' > launch.json`);
      const results = util.generateSettings(process.env);
      assert.equal(results.METEOR_OUTPUT_ABSOLUTE, `${process.cwd()}/.build`);
    });
    it("should set as absolute of .build if blank METEOR_OUTPUT_DIR", () => {
      // eslint-disable-next-line
      execSync(`echo '{"METEOR_OUTPUT_DIR": ""}' > launch.json`);
      const results = util.generateSettings(process.env);
      assert.equal(results.METEOR_OUTPUT_ABSOLUTE, `${process.cwd()}/.build`);
    });
    it("should set absolute of METEOR_OUTPUT_DIR if exists", () => {
      // eslint-disable-next-line
      execSync(`echo '{"METEOR_OUTPUT_DIR": "../nonsense"}' > launch.json`);
      const results = util.generateSettings(process.env);
      assert.equal(
        results.METEOR_OUTPUT_ABSOLUTE,
        resolve(
          process.cwd(),
          "..",
          "nonsense",
        ),
      );
    });
  });
  describe("FL_REPORT_PATH", () => {
    beforeEach(() => {
      delete require.cache[
        `${process.cwd()}/launch.json`
      ];
    });
    it("should use .build by default", () => {
      // eslint-disable-next-line
      execSync(`echo '{}' > launch.json`);
      const results = util.generateSettings(process.env);
      assert.equal(results.FL_REPORT_PATH, resolve(
        process.cwd(),
        ".build",
        "ios",
      ));
    });
    it("should use custom output dir if specified", () => {
      // eslint-disable-next-line
      execSync(`echo '{"METEOR_OUTPUT_DIR": "../nonsense"}' > launch.json`);
      const results = util.generateSettings(process.env);
      assert.equal(results.FL_REPORT_PATH, resolve(
        process.cwd(),
        "..",
        "nonsense",
        "ios",
      ));
    });
  });
  describe("XCODE_PROJECT", () => {
    beforeEach(() => {
      delete require.cache[
        `${process.cwd()}/launch.json`
      ];
    });
    it("should use .build by default", () => {
      // eslint-disable-next-line
      execSync(`echo '{"XCODE_SCHEME_NAME": "scheme"}' > launch.json`);
      const results = util.generateSettings(process.env);
      assert.equal(results.XCODE_PROJECT, resolve(
        process.cwd(),
        ".build",
        "ios",
        "project",
        "scheme.xcodeproj",
      ));
    });
    it("should use custom output dir if specified", () => {
      // eslint-disable-next-line
      execSync(`echo '{"XCODE_SCHEME_NAME": "scheme", "METEOR_OUTPUT_DIR": "../nonsense"}' > launch.json`);
      const results = util.generateSettings(process.env);
      assert.equal(results.XCODE_PROJECT, resolve(
        process.cwd(),
        "..",
        "nonsense",
        "ios",
        "project",
        "scheme.xcodeproj",
      ));
    });
  });
  describe("SIGH_OUTPUT_PATH", () => {
    beforeEach(() => {
      delete require.cache[
        `${process.cwd()}/launch.json`
      ];
    });
    it("should be the current directory", () => {
      // eslint-disable-next-line
      execSync(`echo '{}' > launch.json`);
      const results = util.generateSettings(process.env);
      assert.equal(results.SIGH_OUTPUT_PATH, process.cwd());
    });
  });
  describe("GYM_OUTPUT_DIRECTORY", () => {
    beforeEach(() => {
      delete require.cache[
        `${process.cwd()}/launch.json`
      ];
    });
    it("should be the current directory", () => {
      // eslint-disable-next-line
      execSync(`echo '{}' > launch.json`);
      const results = util.generateSettings(process.env);
      assert.equal(results.GYM_OUTPUT_DIRECTORY, process.cwd());
    });
  });
  describe("overrides", () => {
    it("should override launch file with env vars", () => {
      // eslint-disable-next-line
      execSync(`echo '{"METEOR_OUTPUT_DIR": "something"}' > launch.json`);
      process.env.METEOR_OUTPUT_DIR = "nothing";
      const results = util.generateSettings(process.env);
      assert.equal(results.METEOR_OUTPUT_DIR, "nothing");
    });
    afterEach(() => {
      delete process.env.METEOR_OUTPUT_DIR;
    });
  });
});
describe("launchFile", () => {
  describe("should short circuit if", () => {
    it("init action", () => {
      process.argv = [null, null, "init"];
      const result = util.launchFile();
      assert.isFalse(result);
    });
    it("help action", () => {
      process.argv = [null, null, "help"];
      const result = util.launchFile();
      assert.isFalse(result);
    });
    it("no action", () => {
      process.argv = [];
      const result = util.launchFile();
      assert.isFalse(result);
    });
    it("checking version", () => {
      process.argv = [null, null, "--version"];
      const result = util.launchFile();
      assert.isFalse(result);
    });
    it("checking version shortcut", () => {
      process.argv = [null, null, "-v"];
      const result = util.launchFile();
      assert.isFalse(result);
    });
  });
  it("should error if no launch.json");
  it("should return true if launch.json", () => {
    // eslint-disable-next-line
    execSync(`echo '{}' > launch.json`);
    process.argv = [null, null, "someaction"];
    const result = util.launchFile();
    assert.isTrue(result);
  });
});
describe("init", () => {
  it("should create launch.json if doesn't exist", (done) => {
    util.init()
      .then((response) => {
        assert.include(
          response,
          "launch.json created. Open it and fill out the vars",
        );
        try {
          statSync("launch.json");
          done();
        } catch (error) {
          assert.fail();
          done();
        }
      });
  });
  it("should do nothing if launch.json exists", (done) => {
    // eslint-disable-next-line
    execSync(`echo '{}' > launch.json`);
    util.init()
      .then((response) => {
        assert.include(
          response,
          "launch.json already exists",
        );
        try {
          statSync("launch.json");
          assert.fail();
          done();
        } catch (error) {
          done();
        }
      });
  });
});
describe("importCerts", () => {
  it("should just work", (done) => {
    process.env.PATH = `${process.cwd()}/src/__test/mocks:${process.env.PATH}`;
    util.importCerts()
      .then((result) => {
        assert.equal(result, "imported");
        done();
      })
    ;
  });
});
describe("hasPlatform", () => {
  it("should return true if has platform", () => {
    process.env.PATH = `${process.cwd()}/src/__test/mocks:${process.env.PATH}`;
    const result = util.hasPlatform("android");
    assert.isTrue(result);
  });
  it("should return false if doesn't have platform", () => {
    process.env.PATH = `${process.cwd()}/src/__test/mocks:${process.env.PATH}`;
    const result = util.hasPlatform("nonplatform");
    assert.isFalse(result);
  });
});
describe("getVersion", () => {
  it("should return version number", () => {
    const result = util.getVersion();
    assert.equal(result, version);
  });
});
describe("cleanMeteorOutputDir", () => {
  it("should remove existing build folder", (done) => {
    rimraf.sync(".build");
    execSync("mkdir .build && touch .build/test");
    statSync(".build/test");
    process.env.METEOR_OUTPUT_DIR = ".build";
    util.cleanMeteorOutputDir(process.env);
    try {
      statSync(".build");
    } catch (error) {
      done();
    }
  });
});
