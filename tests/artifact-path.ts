const { CUA_TEST_ARTIFACT } = process.env;
export const artifactPath = CUA_TEST_ARTIFACT ?? "artifacts/development-fixture.json";
