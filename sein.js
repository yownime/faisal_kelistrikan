document.addEventListener('DOMContentLoaded', () => {
    // Global variables
    const components = document.querySelectorAll('.component');
    const workspaceArea = document.getElementById('workspace-area');
    let selectedPoint = null;
    let connections = [];
    let turnStates = {
        left: false,
        right: false
    };
    let blinkInterval = null;
    let blinkState = false;

    // Initialize event listeners
    components.forEach(component => {
        component.addEventListener('click', handleComponentClick);
    });

    // Component creation and management
    function handleComponentClick(e) {
        const clone = this.cloneNode(true);
        clone.style.position = 'absolute';
        
        // Center component in workspace
        const workspaceRect = workspaceArea.getBoundingClientRect();
        const centerX = workspaceRect.width / 2;
        const centerY = workspaceRect.height / 2;
        
        clone.style.left = `${centerX - clone.offsetWidth / 2}px`;
        clone.style.top = `${centerY - clone.offsetHeight / 2}px`;

        // Add connection points based on component type
        setupComponentConnections(clone, this.dataset.component);
        
        // Add event listeners for component manipulation
        clone.addEventListener('mousedown', handleMouseDown);
        clone.addEventListener('contextmenu', handleContextMenu);
        workspaceArea.appendChild(clone);
    }

    function setupComponentConnections(clone, componentType) {
        switch(componentType) {
            case 'battery':
                setupBattery(clone);
                break;
            case 'fuse':
                setupFuse(clone);
                break;
            case 'light':
                setupLight(clone);
                break;
            case 'sw-sein': // New combined turn switch component
                setupSwSein(clone);
                break;
            case 'flasher':
                setupFlasher(clone);
                break;
            case 'socket':
                setupSocket(clone);
                break;
        }
    }

    // New function to setup the combined SW Sein component
        function setupSwSein(clone) {
        // Add input terminal
        const inputPoint = document.createElement('div');
        inputPoint.className = 'connection-point input';
        inputPoint.dataset.type = 'input';
        inputPoint.style.left = '-4px';
        inputPoint.style.top = '50%';
        inputPoint.style.transform = 'translateY(-50%)';
        clone.appendChild(inputPoint);
        inputPoint.addEventListener('click', handleConnectionPointClick);
    
        // Add left output terminal
        const leftOutputPoint = document.createElement('div');
        leftOutputPoint.className = 'connection-point output left-output';
        leftOutputPoint.dataset.type = 'output';
        leftOutputPoint.dataset.direction = 'left';
        leftOutputPoint.style.right = '-4px';
        leftOutputPoint.style.top = '30%';
        clone.appendChild(leftOutputPoint);
        leftOutputPoint.addEventListener('click', handleConnectionPointClick);
    
        // Add right output terminal
        const rightOutputPoint = document.createElement('div');
        rightOutputPoint.className = 'connection-point output right-output';
        rightOutputPoint.dataset.type = 'output';
        rightOutputPoint.dataset.direction = 'right';
        rightOutputPoint.style.right = '-4px';
        rightOutputPoint.style.top = '70%';
        clone.appendChild(rightOutputPoint);
        rightOutputPoint.addEventListener('click', handleConnectionPointClick);
    
        // Create switch container div
        const switchContainer = document.createElement('div');
        switchContainer.className = 'switch-container';
        switchContainer.style.display = 'flex';
        switchContainer.style.flexDirection = 'row';
        switchContainer.style.justifyContent = 'flex-start'; // Changed to flex-start to align buttons to the left
        switchContainer.style.marginTop = '10px';
        switchContainer.style.width = '70%'; // Reduced width
        switchContainer.style.gap = '8px'; // Keep small gap between buttons
        switchContainer.style.margin = '10px 0 10px 10px'; // Left margin only
    
        // Create left button
        const leftButton = document.createElement('button');
        leftButton.className = 'turn-switch-button left-button';
        leftButton.textContent = 'KIRI: OFF';
        leftButton.dataset.state = 'off';
        leftButton.dataset.direction = 'left';
        leftButton.style.padding = '4px 8px';
        leftButton.style.fontSize = '10px';
        leftButton.style.whiteSpace = 'nowrap';
        leftButton.style.position = 'relative';
        leftButton.style.minWidth = '55px';
        leftButton.addEventListener('click', handleTurnSwitchClick);
    
        // Create right button
        const rightButton = document.createElement('button');
        rightButton.className = 'turn-switch-button right-button';
        rightButton.textContent = 'KANAN: OFF';
        rightButton.dataset.state = 'off';
        rightButton.dataset.direction = 'right';
        rightButton.style.padding = '4px 8px';
        rightButton.style.fontSize = '10px';
        rightButton.style.whiteSpace = 'nowrap';
        rightButton.style.position = 'relative';
        rightButton.style.minWidth = '55px';
        rightButton.addEventListener('click', handleTurnSwitchClick);
    
        // Add buttons to container
        switchContainer.appendChild(leftButton);
        switchContainer.appendChild(rightButton);
    
        // Add container to component
        clone.appendChild(switchContainer);
    
        // Make component wider to fit both buttons with spacing
        clone.style.minWidth = '180px';
        clone.style.padding = '10px';
        
        // Add extra space on the right side to avoid overlap with connection points
        clone.style.paddingRight = '25px';
    }
    
    // Handler for turn switch button clicks
    function handleTurnSwitchClick(e) {
        e.stopPropagation();
        const button = e.target;
        const direction = button.dataset.direction;
        
        // Toggle switch state
        if (button.dataset.state === 'off') {
            // Turn off the other button if it's on
            const switchContainer = button.closest('.switch-container');
            const otherButton = switchContainer.querySelector(`.turn-switch-button:not([data-direction="${direction}"])`);
            
            if (otherButton && otherButton.dataset.state === 'on') {
                otherButton.dataset.state = 'off';
                otherButton.textContent = `${otherButton.dataset.direction === 'left' ? 'KIRI' : 'KANAN'}: OFF`;
                turnStates[otherButton.dataset.direction] = false;
            }
            
            // Turn on this button
            button.dataset.state = 'on';
            button.textContent = `${direction === 'left' ? 'KIRI' : 'KANAN'}: ON`;
            turnStates[direction] = true;
        } else {
            // Turn off this button
            button.dataset.state = 'off';
            button.textContent = `${direction === 'left' ? 'KIRI' : 'KANAN'}: OFF`;
            turnStates[direction] = false;
        }
        
        updatePowerState();
    }

    function setupBattery(clone) {
        // Add positive terminal
        addConnectionPoint(clone, 'connection-point output positive', 'output', 'positive');
        
        // Add negative terminal
        addConnectionPoint(clone, 'connection-point output negative', 'output', 'negative');
        
        // Add voltage control
        const voltageControl = document.createElement('div');
        voltageControl.className = 'voltage-control';
        voltageControl.innerHTML = `
            <input type="number" min="0" max="24" step="0.1" value="12.0" class="voltage-input">
            <span>V</span>
        `;
        clone.appendChild(voltageControl);

        const input = voltageControl.querySelector('.voltage-input');
        input.addEventListener('input', (e) => {
            let value = parseFloat(e.target.value);
            if (isNaN(value)) value = 0;
            if (value < 0) value = 0;
            if (value > 24) value = 24;
            updatePowerState();
        });
    }

    function setupFuse(clone) {
        // Add input terminal
        const inputPoint = document.createElement('div');
        inputPoint.className = 'connection-point input';
        inputPoint.dataset.type = 'input';
        inputPoint.style.left = '-4px';
        inputPoint.style.top = '50%';
        inputPoint.style.transform = 'translateY(-50%)';
        clone.appendChild(inputPoint);
        inputPoint.addEventListener('click', handleConnectionPointClick);

        // Add output terminal
        const outputPoint = document.createElement('div');
        outputPoint.className = 'connection-point output';
        outputPoint.dataset.type = 'output';
        outputPoint.style.right = '-4px';
        outputPoint.style.top = '50%';
        outputPoint.style.transform = 'translateY(-50%)';
        clone.appendChild(outputPoint);
        outputPoint.addEventListener('click', handleConnectionPointClick);
    }

    function setupLight(clone) {
        // Add input terminal
        const inputPoint = document.createElement('div');
        inputPoint.className = 'connection-point input';
        inputPoint.dataset.type = 'input';
        inputPoint.style.left = '-4px';
        inputPoint.style.top = '50%';
        inputPoint.style.transform = 'translateY(-50%)';
        clone.appendChild(inputPoint);
        inputPoint.addEventListener('click', handleConnectionPointClick);

        // Add output terminal
        const outputPoint = document.createElement('div');
        outputPoint.className = 'connection-point output';
        outputPoint.dataset.type = 'output';
        outputPoint.style.right = '-4px';
        outputPoint.style.top = '50%';
        outputPoint.style.transform = 'translateY(-50%)';
        clone.appendChild(outputPoint);
        outputPoint.addEventListener('click', handleConnectionPointClick);
    }

    function setupFlasher(clone) {
        // Add input terminal
        const inputPoint = document.createElement('div');
        inputPoint.className = 'connection-point input';
        inputPoint.dataset.type = 'input';
        inputPoint.style.left = '-4px';
        inputPoint.style.top = '50%';
        inputPoint.style.transform = 'translateY(-50%)';
        clone.appendChild(inputPoint);
        inputPoint.addEventListener('click', handleConnectionPointClick);

        // Add output terminal
        const outputPoint = document.createElement('div');
        outputPoint.className = 'connection-point output';
        outputPoint.dataset.type = 'output';
        outputPoint.style.right = '-4px';
        outputPoint.style.top = '50%';
        outputPoint.style.transform = 'translateY(-50%)';
        clone.appendChild(outputPoint);
        outputPoint.addEventListener('click', handleConnectionPointClick);
        
        // Add label to indicate it's a flasher
        const label = document.createElement('div');
        label.className = 'flasher-label';
        label.textContent = 'Flasher';
        label.style.textAlign = 'center';
        label.style.fontSize = '12px';
        label.style.marginTop = '5px';
        clone.appendChild(label);
    }

    function setupSocket(clone) {
        // Add input terminal
        const inputPoint = document.createElement('div');
        inputPoint.className = 'connection-point input';
        inputPoint.dataset.type = 'input';
        inputPoint.style.left = '-4px';
        inputPoint.style.top = '50%';
        inputPoint.style.transform = 'translateY(-50%)';
        clone.appendChild(inputPoint);
        inputPoint.addEventListener('click', handleConnectionPointClick);

        // Add output terminal
        const outputPoint = document.createElement('div');
        outputPoint.className = 'connection-point output';
        outputPoint.dataset.type = 'output';
        outputPoint.style.right = '-4px';
        outputPoint.style.top = '50%';
        outputPoint.style.transform = 'translateY(-50%)';
        clone.appendChild(outputPoint);
        outputPoint.addEventListener('click', handleConnectionPointClick);
    }

    function addConnectionPoint(parent, className, type, extraData = null) {
        const point = document.createElement('div');
        point.className = className;
        point.dataset.type = type;
        if (extraData) {
            point.dataset[extraData] = extraData;
        }
        parent.appendChild(point);
        point.addEventListener('click', handleConnectionPointClick);
        return point;
    }

    // Component manipulation
    function handleContextMenu(e) {
        e.preventDefault();
        const component = e.currentTarget;

        // Remove associated connections
        const points = component.querySelectorAll('.connection-point');
        points.forEach(point => {
            connections = connections.filter(conn => {
                if (conn.startPoint === point || conn.endPoint === point) {
                    conn.wire.remove();
                    return false;
                }
                return true;
            });
        });

        component.remove();
        updatePowerState();
    }

    function handleMouseDown(e) {
        if (e.button !== 0) return; // Only handle left mouse button
        if (e.target.classList.contains('voltage-input')) return; // Don't drag when adjusting voltage
        if (e.target.classList.contains('connection-point')) return; // Don't drag when clicking connection points
        if (e.target.classList.contains('turn-switch-button')) return; // Don't drag when clicking switch buttons
        
        const component = e.currentTarget;
        let isDragging = true;
        let startX = e.clientX - component.offsetLeft;
        let startY = e.clientY - component.offsetTop;

        function handleMouseMove(e) {
            if (!isDragging) return;

            const newX = e.clientX - startX;
            const newY = e.clientY - startY;

            component.style.left = `${newX}px`;
            component.style.top = `${newY}px`;

            // Update connected wires
            const points = component.querySelectorAll('.connection-point');
            points.forEach(point => {
                connections.forEach(conn => {
                    if (conn.startPoint === point || conn.endPoint === point) {
                        updateWirePosition(conn);
                    }
                });
            });
        }

        function handleMouseUp() {
            isDragging = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    // Connection management
    function handleConnectionPointClick(e) {
        e.stopPropagation();
        const point = e.target;

        if (!selectedPoint) {
            selectedPoint = point;
            point.classList.add('selected');
        } else {
            // Check if trying to connect to self
            if (selectedPoint === point) {
                selectedPoint.classList.remove('selected');
                selectedPoint = null;
                return;
            }

            // Check if points are on the same component
            const selectedComponent = selectedPoint.closest('.component');
            const targetComponent = point.closest('.component');
            if (selectedComponent === targetComponent) {
                selectedPoint.classList.remove('selected');
                selectedPoint = null;
                return;
            }

            // Show color picker before creating connection
            showWireColorPicker(selectedPoint, point);
        }
    }

    // Wire color picker
    function showWireColorPicker(startPoint, endPoint) {
        // Create color picker container
        const colorPicker = document.createElement('div');
        colorPicker.className = 'color-picker';
        colorPicker.style.position = 'fixed';
        colorPicker.style.zIndex = '1000';
        
        // Position in the middle of the screen
        colorPicker.style.top = '50%';
        colorPicker.style.left = '50%';
        colorPicker.style.transform = 'translate(-50%, -50%)';
        
        // Style the color picker
        colorPicker.style.backgroundColor = 'white';
        colorPicker.style.padding = '15px';
        colorPicker.style.borderRadius = '8px';
        colorPicker.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
        
        // Add title
        const title = document.createElement('h3');
        title.textContent = 'Pilih Warna Kabel';
        title.style.margin = '0 0 10px 0';
        title.style.textAlign = 'center';
        colorPicker.appendChild(title);
        
        // Create color picker content
        const colorPickerContent = document.createElement('div');
        colorPickerContent.className = 'color-picker-content';
        colorPickerContent.style.display = 'grid';
        colorPickerContent.style.gridTemplateColumns = 'repeat(3, 1fr)';
        colorPickerContent.style.gap = '10px';
        
        // Available wire colors
        const wireColors = [
            { name: 'Merah', value: '#ff0000' },
            { name: 'Hitam', value: '#000000' },
            { name: 'Biru', value: '#0000ff' },
            { name: 'Hijau', value: '#00ff00' },
            { name: 'Kuning', value: '#ffff00' },
            { name: 'Oranye', value: '#ffa500' }
        ];
        
        // Create color buttons
        wireColors.forEach(color => {
            const colorButton = document.createElement('button');
            colorButton.className = 'color-button';
            colorButton.style.width = '60px';
            colorButton.style.height = '30px';
            colorButton.style.backgroundColor = color.value;
            colorButton.style.border = '2px solid #ccc';
            colorButton.style.borderRadius = '4px';
            colorButton.style.cursor = 'pointer';
            colorButton.style.display = 'flex';
            colorButton.style.flexDirection = 'column';
            colorButton.style.alignItems = 'center';
            colorButton.style.justifyContent = 'center';
            
            // Add color name
            const colorName = document.createElement('span');
            colorName.textContent = color.name;
            colorName.style.fontSize = '10px';
            colorName.style.marginTop = '5px';
            colorName.style.color = color.value === '#000000' ? 'white' : 'black';
            colorButton.appendChild(colorName);
            
            // Handle color selection
            colorButton.addEventListener('click', () => {
                createConnection(startPoint, endPoint, color.value);
                document.body.removeChild(colorPicker);
                
                // Reset selection
                selectedPoint.classList.remove('selected');
                selectedPoint = null;
                
                // Update power state after new connection
                updatePowerState();
            });
            
            colorPickerContent.appendChild(colorButton);
        });
        
        colorPicker.appendChild(colorPickerContent);
        
        // Add cancel button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Batal';
        cancelButton.style.marginTop = '15px';
        cancelButton.style.padding = '5px 10px';
        cancelButton.style.backgroundColor = '#f8f9fa';
        cancelButton.style.border = '1px solid #ddd';
        cancelButton.style.borderRadius = '4px';
        cancelButton.style.cursor = 'pointer';
        cancelButton.style.display = 'block';
        cancelButton.style.width = '100%';
        
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(colorPicker);
            selectedPoint.classList.remove('selected');
            selectedPoint = null;
        });
        
        colorPicker.appendChild(cancelButton);
        
        // Add to document
        document.body.appendChild(colorPicker);
    }

    function createConnection(startPoint, endPoint, wireColor = '#000000') {
        const wire = document.createElement('div');
        wire.className = 'wire';
        wire.style.backgroundColor = wireColor;
        workspaceArea.appendChild(wire);
        
        const connection = {
            startPoint,
            endPoint,
            wire,
            color: wireColor
        };
        
        connections.push(connection);
        updateWirePosition(connection);
    }

    function updateWirePosition(connection) {
        const startRect = connection.startPoint.getBoundingClientRect();
        const endRect = connection.endPoint.getBoundingClientRect();
        const workspaceRect = workspaceArea.getBoundingClientRect();

        const startX = startRect.left + startRect.width / 2 - workspaceRect.left;
        const startY = startRect.top + startRect.height / 2 - workspaceRect.top;
        const endX = endRect.left + endRect.width / 2 - workspaceRect.left;
        const endY = endRect.top + endRect.height / 2 - workspaceRect.top;

        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX);

        connection.wire.style.left = `${startX}px`;
        connection.wire.style.top = `${startY}px`;
        connection.wire.style.width = `${length}px`;
        connection.wire.style.transform = `rotate(${angle}rad)`;
    }

    // Blinking functionality
    function startBlinking() {
        if (blinkInterval) {
            clearInterval(blinkInterval);
        }
        
        blinkInterval = setInterval(() => {
            blinkState = !blinkState;
            
            // Update all blinking elements
            const blinkingLights = workspaceArea.querySelectorAll('.light-bulb.blinking');
            const blinkingWires = workspaceArea.querySelectorAll('.wire.blinking');
            
            blinkingLights.forEach(light => {
                if (blinkState) {
                    light.classList.add('powered');
                } else {
                    light.classList.remove('powered');
                }
            });
            
            blinkingWires.forEach(wire => {
                if (blinkState) {
                    wire.classList.add('powered');
                } else {
                    wire.classList.remove('powered');
                }
            });
        }, 500); // 500ms for a 1-second cycle (on for 500ms, off for 500ms)
    }

    function stopBlinking() {
        if (blinkInterval) {
            clearInterval(blinkInterval);
            blinkInterval = null;
        }
        
        // Reset all blinking elements
        const blinkingLights = workspaceArea.querySelectorAll('.light-bulb.blinking');
        const blinkingWires = workspaceArea.querySelectorAll('.wire.blinking');
        
        blinkingLights.forEach(light => {
            light.classList.remove('powered');
            light.classList.remove('blinking');
        });
        
        blinkingWires.forEach(wire => {
            wire.classList.remove('powered');
            wire.classList.remove('blinking');
        });
    }

    // Circuit analysis and power state management
    function updatePowerState() {
        // First, stop any existing blinking
        stopBlinking();
        
        // Reset all powered states
        const allLights = workspaceArea.querySelectorAll('.light-bulb');
        const allWires = workspaceArea.querySelectorAll('.wire');
        
        allLights.forEach(light => {
            light.classList.remove('powered');
            light.classList.remove('blinking');
        });
        
        allWires.forEach(wire => {
            wire.classList.remove('powered');
            wire.classList.remove('blinking');
        });
        
        // Check if any turn signal is active
        const anyTurnSignalActive = turnStates.left || turnStates.right;
        
        if (!anyTurnSignalActive) {
            showDebugMessage('Tidak ada sein yang aktif. Aktifkan saklar sein kiri atau kanan.');
            return;
        }
        
        // Start the circuit analysis
        const batteries = Array.from(workspaceArea.querySelectorAll('.battery'));
        const lights = Array.from(workspaceArea.querySelectorAll('.light'));
        const flashers = Array.from(workspaceArea.querySelectorAll('.flasher'));
        const swSeins = Array.from(workspaceArea.querySelectorAll('.sw-sein')); 
        const sockets = Array.from(workspaceArea.querySelectorAll('.socket'));
        const fuses = Array.from(workspaceArea.querySelectorAll('.fuse'));
        
        // Debug variables to track circuit completion
        let circuitComplete = false;
        let blinkingElementsAdded = false;
        
        // Check if we have the minimum required components
        if (batteries.length === 0 || lights.length === 0) {
            let missingComponents = [];
            if (batteries.length === 0) missingComponents.push("Baterai");
            if (lights.length === 0) missingComponents.push("Lampu");
            
            const message = `Komponen tidak lengkap. Tambahkan: ${missingComponents.join(', ')}`;
            showDebugMessage(message);
            return;
        }
        
        // Track powered components
        const poweredComponents = new Set();
        
        // Analyze the circuit
        batteries.forEach(battery => {
            const voltage = parseFloat(battery.querySelector('.voltage-input').value) || 0;
            
            // Check if voltage is at least 12V
            if (voltage < 12) {
                showDebugMessage('Tegangan baterai kurang dari 12V. Atur tegangan baterai minimal 12V');
                return;
            }
            
            // Get battery terminals
            const batteryPositive = battery.querySelector('.connection-point.positive');
            
            if (!batteryPositive) {
                showDebugMessage('Terminal positif baterai tidak ditemukan');
                return;
            }
            
            // Add battery to powered components
            poweredComponents.add(battery);
            
            // Check all connections from battery
            const batteryConnections = connections.filter(conn => conn.startPoint === batteryPositive);
            
            if (batteryConnections.length === 0) {
                showDebugMessage('Baterai tidak terhubung ke komponen lain');
                return;
            }
            
            // Power all connections from battery
            batteryConnections.forEach(conn => {
                conn.wire.classList.add('powered');
                const endComponent = conn.endPoint.closest('.component');
                if (endComponent) {
                    poweredComponents.add(endComponent);
                    
                    // If connected to fuse, follow connections from fuse
                    if (endComponent.classList.contains('fuse')) {
                        const fuseOutput = endComponent.querySelector('.connection-point.output');
                        const fuseConnections = connections.filter(c => c.startPoint === fuseOutput);
                        
                        fuseConnections.forEach(fuseConn => {
                            fuseConn.wire.classList.add('powered');
                            const fuseEndComponent = fuseConn.endPoint.closest('.component');
                            if (fuseEndComponent) {
                                poweredComponents.add(fuseEndComponent);
                            }
                        });
                    }
                }
            });
            
            // Check if flashers are powered
            flashers.forEach(flasher => {
                if (poweredComponents.has(flasher)) {
                    const flasherOutput = flasher.querySelector('.connection-point.output');
                    const flasherConnections = connections.filter(conn => conn.startPoint === flasherOutput);
                    
                    flasherConnections.forEach(conn => {
                        conn.wire.classList.add('powered');
                        conn.wire.classList.add('blinking');
                        
                        const endComponent = conn.endPoint.closest('.component');
                        if (endComponent) {
                            poweredComponents.add(endComponent);
                            
                            // If connected directly to light
                            if (endComponent.classList.contains('light')) {
                                const lightBulb = endComponent.querySelector('.light-bulb');
                                if (lightBulb) {
                                    lightBulb.classList.add('blinking');
                                    blinkingElementsAdded = true;
                                }
                            }
                            
                            // If connected to SW Sein
                            if (endComponent.classList.contains('sw-sein')) {
                                // Get the active output based on turn states
                                const leftOutput = endComponent.querySelector('.connection-point.left-output');
                                const rightOutput = endComponent.querySelector('.connection-point.right-output');
                                
                                // Check connections from SW Sein outputs based on active turn signals
                                connections.forEach(swConn => {
                                    if ((swConn.startPoint === leftOutput && turnStates.left) || 
                                        (swConn.startPoint === rightOutput && turnStates.right)) {
                                        
                                        swConn.wire.classList.add('powered');
                                        swConn.wire.classList.add('blinking');
                                        
                                        const swEndComponent = swConn.endPoint.closest('.component');
                                        if (swEndComponent && swEndComponent.classList.contains('light')) {
                                            const lightBulb = swEndComponent.querySelector('.light-bulb');
                                            if (lightBulb) {
                                                lightBulb.classList.add('blinking');
                                                blinkingElementsAdded = true;
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            });
            
            // Check if SW Seins are powered directly
            swSeins.forEach(swSein => {
                if (poweredComponents.has(swSein)) {
                    // Get the active output based on turn states
                    const leftOutput = swSein.querySelector('.connection-point.left-output');
                    const rightOutput = swSein.querySelector('.connection-point.right-output');
                    
                    // Check connections from SW Sein outputs based on active turn signals
                    connections.forEach(conn => {
                        if ((conn.startPoint === leftOutput && turnStates.left) || 
                            (conn.startPoint === rightOutput && turnStates.right)) {
                            
                            conn.wire.classList.add('powered');
                            
                            const endComponent = conn.endPoint.closest('.component');
                            if (endComponent) {
                                poweredComponents.add(endComponent);
                                
                                // If connected to light
                                if (endComponent.classList.contains('light')) {
                                    conn.wire.classList.add('blinking');
                                    const lightBulb = endComponent.querySelector('.light-bulb');
                                    if (lightBulb) {
                                        lightBulb.classList.add('blinking');
                                        blinkingElementsAdded = true;
                                    }
                                }
                                
                                // If connected to flasher
                                if (endComponent.classList.contains('flasher')) {
                                    const flasherOutput = endComponent.querySelector('.connection-point.output');
                                    const flasherConnections = connections.filter(c => c.startPoint === flasherOutput);
                                    
                                    flasherConnections.forEach(flasherConn => {
                                        flasherConn.wire.classList.add('powered');
                                        flasherConn.wire.classList.add('blinking');
                                        
                                        const flasherEndComponent = flasherConn.endPoint.closest('.component');
                                        if (flasherEndComponent && flasherEndComponent.classList.contains('light')) {
                                            const lightBulb = flasherEndComponent.querySelector('.light-bulb');
                                            if (lightBulb) {
                                                lightBulb.classList.add('blinking');
                                                blinkingElementsAdded = true;
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            });
        });
        
        // If blinking elements were added, start the blinking animation
        if (blinkingElementsAdded) {
            startBlinking();
            showDebugMessage('Rangkaian sein berfungsi dengan baik! ✓', true);
        } else {
            showDebugMessage('Rangkaian tidak lengkap atau tidak ada lampu yang berkedip. Periksa koneksi antara komponen.', false);
        }
    }

    // Debug message display
    function showDebugMessage(message, isSuccess = false) {
        let debugPanel = document.getElementById('debug-panel');
        
        if (!debugPanel) {
            debugPanel = document.createElement('div');
            debugPanel.id = 'debug-panel';
            debugPanel.style.position = 'fixed';
            debugPanel.style.bottom = '10px';
            debugPanel.style.left = '10px';
            debugPanel.style.right = '10px';
            debugPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            debugPanel.style.color = 'white';
            debugPanel.style.padding = '10px';
            debugPanel.style.borderRadius = '5px';
            debugPanel.style.fontFamily = 'monospace';
            debugPanel.style.zIndex = '1000';
            debugPanel.style.maxHeight = '150px';
            debugPanel.style.overflowY = 'auto';
            document.body.appendChild(debugPanel);
        }
        
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.style.marginBottom = '5px';
        
        // Add color based on message type
        if (isSuccess) {
            messageElement.style.color = '#69db7c'; // Green for explicit success
            messageElement.style.fontWeight = 'bold';
        } else if (message.includes('tidak ditemukan') || message.includes('tidak lengkap') || message.includes('nol atau negatif')) {
            messageElement.style.color = '#ff6b6b'; // Red for errors
        } else if (message.includes('OK') || message.includes('berfungsi dengan baik')) {
            messageElement.style.color = '#69db7c'; // Green for success
        } else {
            messageElement.style.color = '#ffd43b'; // Yellow for warnings/info
        }
        
        // Clear previous messages
        debugPanel.innerHTML = '';
        debugPanel.appendChild(messageElement);
    }
});