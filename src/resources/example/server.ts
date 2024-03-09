import * as alt from "alt-server";

const demo: iDemo = {
    double: (input) => {
        return input * 2;
    }
};

alt.log(demo.double(2));