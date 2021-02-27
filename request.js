/*
    Проверяем наличие необходимых нам параметров в запросе
*/
module.exports = function checkRequest(json) {

    if (typeof json !== "object") {
        json = {};
    }

    if (typeof json.session !== "object") {
        json.session = {
            session_id: "unknown",
            new: true,
        };
    }

    if (typeof json.request !== "object") {
        json.request = {
            type: '',
            command: '',
            original_utterance: '',
            payload: '',
            nlu: {},
        };
    }

    if (typeof json.request.original_utterance === "undefined") {
        json.request.original_utterance = '';
    }

    if (typeof json.request.command === "undefined") {
        json.request.command = '';
    }

    if (typeof json.request.nlu !== "object") {
        json.request.nlu = {};
    }

    if (typeof json.request.nlu.intents !== "object") {
        json.request.nlu.intents = {};
    }

    if (typeof json.state !== "object") {
        json.state = {
            session: {},
            user: {},
            application: {},
        };
    }

    if (typeof json.state.session !== "object") {
        json.state.session = {};
    }

    if (typeof json.state.user !== "object") {
        json.state.user = {};
    }

    if (typeof json.state.user !== "object") {
        json.state.user = {};
    }

    return json;
}