import { isAssignment } from "langium";
import { Assignment } from "../src/language-server/generated/ast";
import { processDocs } from "./util";

test("vectors parsed correctly", async () => {
    await processDocs({ doc: "a=[1, 2, 3];" });
});