// ==UserScript==
// @name         Select Intelligence
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  划词问 AI
// @author       TnZzZHlp
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    ("use strict");

    let currentTask = null;

    // 创建设置面板
    const settingPanel = document.createElement("div");
    settingPanel.id = "select-intel-panel";
    settingPanel.innerHTML = `
        <h3>Select Intelligence 设置</h3>
        <label>API Key:<br><input type="text" id="si-api-key" style="width: 100%;"></label><br>
        <label>Model:<br><input type="text" id="si-model" style="width: 100%;"></label><br>
        <label>Endpoint:<br><input type="text" id="si-endpoint" style="width: 100%;"></label><br>
        <label>System Prompt:<br><textarea id="si-system-prompt" style="width: 100%; height: 60px;"></textarea></label><br>
        <button id="si-save-btn">保存</button>
    `;
    settingPanel.style.display = "none"; // 默认隐藏
    document.body.appendChild(settingPanel);

    // 创建折叠/展开图标按钮
    const toggleBtn = document.createElement("div");
    toggleBtn.id = "si-toggle-btn";
    toggleBtn.textContent = "🤖";
    toggleBtn.style.cursor = "pointer";
    document.body.appendChild(toggleBtn);

    // 创建小圆点指示器
    const indicator = document.createElement("div");
    indicator.id = "si-indicator";
    document.body.appendChild(indicator);

    // 创建输出面板
    const outputPanel = document.createElement("div");
    outputPanel.id = "si-output-panel";
    outputPanel.innerHTML = `<div></div>`;
    outputPanel.style.display = "none"; // 默认隐藏
    document.body.appendChild(outputPanel);

    // 添加样式
    GM_addStyle(`
        /* 面板主体 */
        #select-intel-panel {
            position: fixed;
            top: 10px;
            right: auto;
            width: 280px;
            background: rgba(32, 32, 32, 0.95);
            color: #eee;
            border: 1px solid #444;
            padding: 12px;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            font-family: "Segoe UI","Helvetica Neue",Arial,sans-serif;
            font-size: 14px;
            border-radius: 6px;
            backdrop-filter: blur(4px);
        }
        /* 标题 */
        #select-intel-panel h3 {
            margin: 0 0 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid #555;
            font-size: 16px;
            font-weight: 600;
        }
        /* 文本输入与下拉 */
        #select-intel-panel input,
        #select-intel-panel textarea {
            width: 100%;
            padding: 6px 8px;
            margin: 4px 0 10px;
            background: #222;
            border: 1px solid #444;
            border-radius: 4px;
            color: #eee;
            font-size: 13px;
            box-sizing: border-box;
        }
        /* 保存按钮 */
        #select-intel-panel button {
            width: 100%;
            padding: 8px;
            background: #006aff;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            transition: background .2s;
        }
        #select-intel-panel button:hover {
            background: #0051cc;
        }
        /* 拖拽按钮 */
        #si-toggle-btn {
            position: fixed;
            top: 10px;
            left: 10px;
            width: 32px;
            height: 32px;
            background: #006aff;
            color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: move;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            transition: background .2s, transform .1s;
            user-select: none;
            z-index: 10000;
        }
        #si-toggle-btn:hover {
            background: #0051cc;
            transform: scale(1.05);
        }
        /* 小圆点指示器 */
        #si-indicator {
            position: fixed;
            top: 10px;
            right: 10px;
            width: 8px;
            height: 8px;
            background: #0051cc;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            z-index: 10001;
            display: none; /* 默认隐藏 */
        }
        /* 输出面板 */
        #si-output-panel {
            position: fixed;
            top: 0;
            left: 0;
            background-color: white;
            width: 600px;
            height: auto;       /* 高度随内容撑开 */
            max-height: 50vh;   /* 最大不超过 30vh */
            z-index: 1000;
            border-radius: 15px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            overflow: auto;     /* 超出启用滚动 */
            -ms-overflow-style: none;  /* IE 10+ */
            scrollbar-width: none;     /* Firefox */
        }

        #si-output-panel div {
            color: black;
            margin: 0;
            white-space: pre-wrap;
            word-break: break-all;
            overflow-wrap: break-word;
            font-size: 16px;
            padding: 10px 13px;
        }

        #si-output-panel div::-webkit-scrollbar {
            display: none;
        }
    `);

    // 加载保存的设置
    function loadSettings() {
        document.getElementById("si-api-key").value = GM_getValue("apiKey", "");
        document.getElementById("si-model").value = GM_getValue("model", "");
        document.getElementById("si-endpoint").value = GM_getValue(
            "endpoint",
            ""
        );
        document.getElementById("si-system-prompt").value = GM_getValue(
            "systemPrompt",
            ""
        );

        // 恢复按钮位置
        const btnPosition = GM_getValue("toggleBtnPosition", {
            left: "10px",
            top: "10px",
        });

        toggleBtn.style.left = btnPosition.left;
        toggleBtn.style.top = btnPosition.top;
    }

    // 保存设置
    function saveSettings() {
        GM_setValue("apiKey", document.getElementById("si-api-key").value);
        GM_setValue("model", document.getElementById("si-model").value);
        GM_setValue("endpoint", document.getElementById("si-endpoint").value);
        GM_setValue(
            "systemPrompt",
            document.getElementById("si-system-prompt").value
        );
        alert("设置已保存");
    }

    // 绑定保存按钮事件
    document
        .getElementById("si-save-btn")
        .addEventListener("click", saveSettings);

    let dragging = false;
    let startX, startY;

    // 阻止图标默认的选中行为
    toggleBtn.addEventListener("selectstart", (e) => {
        e.preventDefault();
    });

    // 监听鼠标事件
    toggleBtn.addEventListener("mousedown", (e) => {
        dragging = true;
        startX = e.clientX;
        startY = e.clientY;
    });

    toggleBtn.addEventListener("mouseup", (e) => {
        // 判断和之前的位置是否有变化
        if (startX === e.clientX && startY === e.clientY) {
            // 打开设置面板
            dragging = false;

            settingPanel.style.display =
                settingPanel.style.display === "none" ? "block" : "none";

            // 设置面板位置
            // 判断上下左右是否有足够空间
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const panelWidth = settingPanel.offsetWidth;
            const panelHeight = settingPanel.offsetHeight;

            if (e.clientX < screenWidth / 2) {
                settingPanel.style.left = `${e.clientX + 20}px`;
            } else {
                settingPanel.style.left = `${e.clientX - panelWidth - 20}px`;
            }

            if (e.clientY < screenHeight / 2) {
                settingPanel.style.top = `${e.clientY + 20}px`;
            } else {
                settingPanel.style.top = `${e.clientY - panelHeight - 20}px`;
            }

            return;
        }

        // 吸附到屏幕边缘
        const screenWidth = window.innerWidth;

        const btnRect = toggleBtn.getBoundingClientRect();
        let left = parseInt(toggleBtn.style.left, 10);
        const btnWidth = btnRect.width;

        // 判断在横向哪边
        if (left < screenWidth / 2) {
            left = 10; // 吸附到左边
        } else {
            left = screenWidth - btnWidth - 10 - 15; // 吸附到右边
        }

        toggleBtn.style.left = `${left}px`;

        // 保存位置
        GM_setValue("toggleBtnPosition", {
            left: toggleBtn.style.left,
            top: toggleBtn.style.top,
        });

        dragging = false;
    });

    // 监听窗口大小变化
    window.addEventListener("resize", () => {
        // 重新计算按钮位置
        // 判断原来位置是在左边还是右边
        if (toggleBtn.style.left.split("px")[0] <= 20) {
            toggleBtn.style.left = "10px";
        } else {
            const screenWidth = window.innerWidth;
            const btnWidth = toggleBtn.offsetWidth;
            toggleBtn.style.left = `${screenWidth - btnWidth - 10 - 15}px`;
        }
    });

    document.addEventListener("mousemove", (e) => {
        if (dragging) {
            const x = e.clientX;
            const y = e.clientY;

            toggleBtn.style.left = `${x - 15}px`;
            toggleBtn.style.top = `${y - 15}px`;
        }
    });

    // 监听选中行为
    document.addEventListener("selectionchange", async () => {
        // 如果有正在进行的请求，取消它
        if (currentTask) {
            currentTask.abort();
            currentTask = null;
        }

        // 移动小圆点指示器位置到选中文本的右上角
        const selection = document.getSelection();
        if (selection.rangeCount > 0 && selection.toString().trim() !== "") {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            indicator.style.display = "block";
            indicator.style.left = `${rect.left + rect.width + 10}px`;
            indicator.style.top = `${rect.top - 10}px`;
            indicator.style.transform = "translateY(0)";
        } else {
            indicator.style.display = "none";
        }
    });

    // 监听小圆点移入事件
    indicator.addEventListener("mouseenter", () => {
        // 如果有正在进行的请求，取消它
        if (currentTask) {
            currentTask.abort();
            currentTask = null;
        }

        // 隐藏小圆点
        indicator.style.display = "none";

        // 设置面板位置
        const selection = document.getSelection();
        if (selection.rangeCount > 0 && selection.toString().trim() !== "") {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // 判断上下左右是否有足够空间
            // 获取离屏幕边缘最近的距离
            const spaceRight =
                window.innerWidth - (rect.left + rect.width + 10);
            const spaceLeft = rect.left - 10;

            //谁大就往哪边放
            if (spaceRight > spaceLeft) {
                outputPanel.style.left = `${rect.left + rect.width + 10}px`;
                outputPanel.style.top = `${rect.top}px`;
            } else {
                outputPanel.style.left = `${rect.left - 10 - 600}px`;
                outputPanel.style.top = `${rect.top}px`;
            }

            // 设置输出面板最大高度
            const maxHeight = window.innerHeight - rect.top;
            outputPanel.style.maxHeight = `${maxHeight}px`;

            outputPanel.style.display = "block";
        }

        // 判断信息是否齐全
        if (
            !GM_getValue("apiKey", "") ||
            !GM_getValue("endpoint", "") ||
            !GM_getValue("model", "")
        ) {
            outputPanel.querySelector("div").textContent = "请检查设置";
            return;
        }

        function setOutputPanel(content) {
            outputPanel.querySelector("div").textContent = content;
            outputPanel.scrollTop = outputPanel.scrollHeight;
        }

        // 发送请求到 AI 接口
        setOutputPanel("");
        currentTask = GM_xmlhttpRequest({
            method: "POST",
            url: GM_getValue("endpoint", ""),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${GM_getValue("apiKey", "")}`,
            },
            data: JSON.stringify({
                model: GM_getValue("model", ""),
                stream: true,
                messages: [
                    {
                        role: "system",
                        content: GM_getValue("systemPrompt", ""),
                    },
                    {
                        role: "user",
                        content: document.getSelection().toString(),
                    },
                ],
            }),
            responseType: "stream",
            onerror: (err) => {
                setOutputPanel("请求失败：" + err);
            },
            onloadstart: (stream) => {
                // 解析原始 ReadableStream
                const reader = stream.response.getReader();
                const decoder = new TextDecoder("utf-8");
                let sseBuffer = "";
                let result = "";
                function pump() {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            setOutputPanel(result);
                        }
                        sseBuffer += decoder.decode(value, { stream: true });
                        const lines = sseBuffer.split("\n");
                        sseBuffer = lines.pop(); // 留下不完整行
                        for (const line of lines) {
                            if (!line.trim().startsWith("data:")) continue;
                            const data = line.slice(5).trim();
                            if (data === "[DONE]") {
                                setOutputPanel(result);
                                return;
                            }
                            try {
                                const parsed = JSON.parse(data);
                                const delta =
                                    parsed.choices?.[0]?.delta?.content;
                                if (delta) {
                                    result += delta;
                                    setOutputPanel(result);
                                }
                            } catch (e) {
                                console.error("解析 SSE 数据失败：", e);
                            }
                        }
                        pump();
                    });
                }
                pump();
            },
        });
    });

    // 点击其他地方隐藏面板
    document.addEventListener("click", (e) => {
        // 如果输出面板显示且点击的不是输出面板内元素，则隐藏输出面板
        if (
            outputPanel.style.display === "block" &&
            !outputPanel.contains(e.target)
        ) {
            outputPanel.style.display = "none";
        }

        // 如果设置面板显示且点击的不是设置面板内元素，则隐藏设置面板
        if (
            settingPanel.style.display === "block" &&
            !settingPanel.contains(e.target) &&
            e.target !== toggleBtn
        ) {
            settingPanel.style.display = "none";
        }
    });

    // 页面滚动隐藏输出面板
    document.addEventListener(
        "scroll",
        () => {
            outputPanel.style.display = "none";
        },
        { passive: true }
    );

    // 初始化
    loadSettings();
})();
