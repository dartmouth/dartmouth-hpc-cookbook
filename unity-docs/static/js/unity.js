function nodeToggle(key) {
    toggleHidden('moreinfo-' + key);
    toggleHidden('expand-nodeinfo-' + key);
    toggleHidden('collapse-nodeinfo-' + key)
}

let nodeFilterSettings = {
    gpu: 'check',
    cpu: 'check',
    open: 'uncheck',
    vram: 0,
    ram: 0
};

let filterTerm = '';

function filterTableByData(toggleKey, show, key, operation, value, elements) {
    let comparison;

    if (operation === "gt") {
        comparison = function(first, second) {
            return first > second;
        }
    } else if (operation === "lt") {
        comparison = function(first, second) {
            return first < second;
        }
    } else if (operation === "eq") {
        comparison = function(first, second) {
            return first === second;
        }
    } else if (operation === "neq") {
        comparison = function(first, second) {
            return first !== second;
        }
    }

    let index = 0;
    while (index < elements.length) {
        if (comparison(elements[index].dataset[key], value)) {
            if (!show) {
                elements[index].classList.add('hidden-row');
                document.getElementById('moreinfo-' + elements[index].id.replace(/^noderow-/, '')).classList.add('hidden-row');
                elements.splice(index, 1);
                index--;
            }
        }     
        index++;   
    }
}

function filterNodeTable(elements) {
    let nodeFilterOperations = {
        gpu: {
            check: [true, 'gpumodel', 'neq', ''],
            uncheck: [false, 'gpumodel', 'neq', '']
        },
        cpu: {
            check: [true, 'gpumodel', 'eq', ''],
            uncheck: [false, 'gpumodel', 'eq', '']
        },
        open: {
            check: [false, 'generaluse', 'eq', 'false'],
            uncheck: [true, 'generaluse', 'neq', 'VOID']
        },
        ram: [false, 'ram', 'lt', nodeFilterSettings.ram],
        vram: [false, 'vram', 'lt', nodeFilterSettings.vram]
    }

    for (const [key, value] of Object.entries(nodeFilterSettings)) {
        try {
            filterTableByData(key, ...(nodeFilterOperations[key][value]), elements);
        } catch {
            filterTableByData(key, ...(nodeFilterOperations[key]), elements);
        }
    }
}

function toggleNodeFilterSetting(key, value) {
    nodeFilterSettings[key] = value;
    let elements = [...document.querySelectorAll('.node-entry')];
    let infoElements = [...document.querySelectorAll('.node-moreinfo')];

    for (const el of elements) {
        el.classList.remove('hidden-row');
    }

    for (const el of infoElements) {
        el.classList.remove('hidden-row');
    }

    filterNodeTable(elements)
    filterByTerm(elements)

    try {
        toggleHidden(key + '-show');
        toggleHidden(key + '-hide');
    } catch (e) {

    }

    if (elements.length > 0) {
        document.getElementById('no-nodes').classList.add('hidden');
    } else {
        document.getElementById('no-nodes').classList.remove('hidden');
    }
}

function setFilterTerm(value) {
    filterTerm = value;
    let elements = [...document.querySelectorAll('.node-entry')];
    let infoElements = [...document.querySelectorAll('.node-moreinfo')];

    for (const el of elements) {
        el.classList.remove('hidden-row');
    }

    for (const el of infoElements) {
        el.classList.remove('hidden-row');
    }
    
    filterNodeTable(elements)
    filterByTerm(elements)

    if (document.querySelectorAll(':not(.hidden-row).node-entry').length > 0) {
        document.getElementById('no-nodes').classList.add('hidden');
    } else {
        document.getElementById('no-nodes').classList.remove('hidden');
    }
}

function filterByTerm(elements) {
    if (filterTerm) {
        for (el of elements) {
            find: {
                for ([key, data] of Object.entries(el.dataset)) {
                    if (String(data).toUpperCase().includes(filterTerm.value.toUpperCase())) {
                        break find;
                    } 
                }
                el.classList.add('hidden-row');
                document.getElementById('moreinfo-' + el.id.replace(/^noderow-/, '')).classList.add('hidden-row');
            }

        }
    }
}
