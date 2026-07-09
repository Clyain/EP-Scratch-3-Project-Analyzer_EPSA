document.getElementById('fileInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    //const output = document.getElementById('output');
    //output.textContent = '读取中...';

    const reader = new FileReader();
    reader.onload = function (event) {
        JSZip.loadAsync(event.target.result)
            .then(function (zip) {
                return zip.file("project.json").async("string");
            })
            .then(async function (jsonStr) {
                const ProjectData = JSON.parse(jsonStr);
                const ProjectExtensions = ProjectData.extensions || [];
                const ProjectExtensionsURLs = ProjectData.extensionURLs || {};
                let ExtensionsSources = {};
                let ExtensionsInfo = {};

                // 内置扩展的中文名称映射
                const basicExtensions = {
                    pen: '画笔',
                    videoSensing: '视频侦测',
                    text2speech: '文字转语音',
                    translate: '翻译',
                    music: '音乐',
                    microbit: 'Micro:bit',
                    ev3: '乐高 EV3',
                    wedo2: '乐高 WeDo 2.0',
                    makeymakey: 'Makey Makey'
                };

                // 先处理内置扩展（没有 URL 的）
                for (let i = 0; i < ProjectExtensions.length; i++) {
                    const extName = ProjectExtensions[i];
                    // 检查是否是内置扩展（basicExtensions 的键）
                    if (basicExtensions.hasOwnProperty(extName)) {
                        ExtensionsInfo[extName] = {
                            name: basicExtensions[extName],
                            color: '#0fbd8c'
                        };
                    }
                }
                const ToplevelBlockOPs = ["event_whengreaterthan", "event_whenflagclicked", "event_whenkeypressed", "event_whenthisspriteclicked", "event_whenstageclicked", "event_whenbackdropswitchesto", "event_whenbroadcastreceived", "control_start_as_clone", "procedures_definition", "videoSensing_whenMotionGreaterThan", "faceSensing_whenTilted", "faceSensing_whenSpriteTouchesPart", "makeymakey_whenMakeyKeyPressed", "makeymakey_whenCodePressed", "microbit_whenButtonPressed", "microbit_whenGesture", "microbit_whenTilted", "microbit_whenPinConnected", "gdxfor_whenGesture", "gdxfor_whenForcePushedOrPulled", "gdxfor_whenTilted", "ev3_whenDistanceLessThan", "ev3_whenBrightnessLessThan", "boost_whenColor", "boost_whenTilted", "wedo2_whenDistance", "wedo2_whenTilted"];
                const MenuOPs = ["motion_goto_menu", "motion_glideto_menu", "motion_pointtowards_menu", "looks_costume", "looks_backdrops", "sound_sounds_menu", "event_broadcast_menu", "control_create_clone_of_menu", "sensing_touchingobjectmenu", "sensing_distancetomenu", "sensing_keyoptions", "sensing_of_object_menu", "music_menu_DRUM", "music_menu_INSTRUMENT", "pen_menu_colorParam", "videoSensing_menu_ATTRIBUTE", "videoSensing_menu_SUBJECT", "videoSensing_menu_VIDEO_STATE", "text2speech_menu_voices", "text2speech_menu_languages", "translate_menu_languages", "makeymakey_menu_KEY", "makeymakey_menu_SEQUENCE", "microbit_menu_buttons", "microbit_menu_gestures", "microbit_menu_tiltDirectionAny", "microbit_menu_tiltDirection", "microbit_menu_touchPins", "gdxfor_menu_gestureOptions", "gdxfor_menu_pushPullOptions", "gdxfor_menu_tiltAnyOptions", "gdxfor_menu_tiltOptions", "gdxfor_menu_axisOptions", "ev3_menu_motorPorts", "ev3_menu_sensorPorts", "boost_menu_MOTOR_ID", "boost_menu_MOTOR_DIRECTION", "boost_menu_MOTOR_REPORTER_ID", "boost_menu_COLOR", "boost_menu_TILT_DIRECTION_ANY", "boost_menu_TILT_DIRECTION", "wedo2_menu_MOTOR_ID", "wedo2_menu_MOTOR_DIRECTION", "wedo2_menu_OP", "wedo2_menu_TILT_DIRECTION_ANY", "wedo2_menu_TILT_DIRECTION"];

                // 遍历扩展URLs，获取源代码（处理有 URL 的扩展）
                const loadPromises = Object.entries(ProjectExtensionsURLs).map(async ([extName, extUrl]) => {
                    try {
                        // 从扩展URLs获取源代码
                        const sourceCode = await LoadExtensionSource(extUrl);
                        ExtensionsSources[extName] = sourceCode;
                        // 通过源代码解析扩展信息
                        const info = GetExtensionsInfo(sourceCode);
                        // 如果解析到了名称，使用解析的名称；否则使用 basicExtensions 中的名称
                        if (info.name) {
                            ExtensionsInfo[extName] = { name: info.name, color: info.color };
                            ToplevelBlockOPs.push(...info.ToplevelBlockOPs);
                            MenuOPs.push(...info.MenuOPs);
                        } else if (basicExtensions.hasOwnProperty(extName)) {
                            ExtensionsInfo[extName] = { name: basicExtensions[extName], color: info.color || '#0fbd8c' };
                        }
                    } catch (err) {
                        console.error(`扩展 "${extName}" 加载失败:`, err.message);
                        ExtensionsSources[extName] = null;
                        // 如果加载失败但有内置名称，使用内置名称
                        if (basicExtensions.hasOwnProperty(extName)) { ExtensionsInfo[extName] = { name: basicExtensions[extName], color: '#0FBD8C' }; } else { ExtensionsInfo[extName] = { name: extName, color: null }; }
                    }
                });

                // 等待所有扩展加载完成
                await Promise.all(loadPromises);
                const stats = CountBlocks(ProjectData, ToplevelBlockOPs, MenuOPs);
                output.textContent = '总积木数量：' + stats.BlocksNum + ' 有效积木数量：' + stats.TrueBlocksNum + ' 总积木段数：' + stats.PilesNum + ' 有效积木段数：' + stats.TruePilesNum + ' 函数定义：' + stats.FuncDefinitions;
                //console.log('所有扩展源代码:', ExtensionsSources);
                //console.log('拓展信息：', ExtensionsInfo);
                //console.log('ToplevelBlockOpcodes：', ToplevelBlockOPs);
                //console.log("MenuOpcodes：", MenuOPs);
            })
            .catch(function (err) {
                output.textContent = '错误: ' + err.message;
                console.error('错误:', err);
            });
    };
    reader.readAsArrayBuffer(file);
});