const Config = require('./config');
const Scenes = require('./scenes');
const Request = require('./request');
const Func = require('./functions');

module.exports.handler = async (event, context) => {
    console.log('Incoming request:', JSON.stringify(event));

    let request = Request(event);
    console.log('Process request', JSON.stringify(request));
    let result = Func.make_response(request, { end_session: true });

    try {
        if (request.request.command === "ping") {
            result.response.text = 'pong';
            result.response.tts = 'pong';
            delete (result.session_state);
        } else {
            let scene = Config.DEFAULT_SCENE;
            let current_scene_id = request?.state[Config.STATE_REQUEST_KEY]?.scene;
            console.log('current_scene_id', current_scene_id);
            if (!Func.is_null(current_scene_id)) {
                scene = current_scene_id;
            }
            if (!Func.is_null(scene) && !Func.is_null(Scenes[scene])) {
                let func = Scenes[scene];
                let type = 'reply';
                let argv = {};
                let hli, hgi;
                func = Scenes[scene];
                hli = Scenes[scene].handle_local_intents(request);
                if (!Func.is_null(hli)) {
                    if (!Func.is_null(hli.func)) {
                        if (typeof hli.func === "object") {
                            func = hli.func;
                        }
                    }
                    if (!Func.is_null(hli.type)) {
                        if (typeof func[hli.type] === "function") {
                            type = hli.type;
                        }
                    }
                    if (!Func.is_null(hli.argv)) {
                        argv = hli.argv;
                    }
                } else {
                    hgi = Scenes[scene].handle_global_intents(request);
                    if (!Func.is_null(hgi)) {
                        if (!Func.is_null(hgi.func)) {
                            if (typeof hgi.func === "object") {
                                func = hgi.func;
                            }
                        }
                    }
                    if (!Func.is_null(hgi.type)) {
                        if (typeof func[hgi.type] === "function") {
                            type = hgi.type;
                        }
                    }
                }

                if (Func.is_null(hli) && Func.is_null(hgi)) {
                    if (typeof func['fallback'] === "function") {
                        type = 'fallback';
                    }
                }
                console.log('index func', func, 'type', type, 'argv', argv);
                if (typeof func[type] === "function") {
                    let tmp = func[type](request, argv);
                    if (!Func.is_null(tmp)) {
                        result = tmp;
                    }
                }
            }
        }
    }
    catch (e) {
        console.error('Fatal error:', e.message);
        console.error('Stack trace:', e.stack);
    }

    console.log('Reply', JSON.stringify(result));
    return result;
};