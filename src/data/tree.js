import { branchAppendEnd, getBranchTail } from "./slot-branch";

export function branchToTree(branch) {
    if (branch === undefined) return undefined
    if (branch.type === 'branch') {
        if (branch.value.length === 1) {
            return _makeTree(branch.value[0], [], branch)            
        } else {
            const tail = getBranchTail(branch)
            if (Array.isArray(tail)) {
                return _makeTree(branch.value[0], branchToTree(tail), tail)
            } else if (tail.type === 'multi') {
                return _makeTree(branch.value[0], branchToTree(tail), branch)
            } else {
                return _makeTree(branch.value[0], [ branchToTree(tail) ], branch)
            }
        }
    } else if (branch.type === 'multi') {
        return branch.value.map(item => branchToTree(item))
    }
}

export function treetoBranch(tree) {
    if (tree === undefined) return undefined
    if (typeof tree === 'string') return tree

    const { value, child } = tree

    if (value === -1) {
        if (child.length > 1) {
            return { type: 'multi', value: child.map(el => treetoBranch(el))}
        } else {
            return treetoBranch(child[0])
        }
    }

    if (child && child.length === 1) {
        const childT = treetoBranch(child[0])
        // const childBranch = _makeBranch('branch', childT.value, childT)
        const branch = _makeBranch('branch', [tree.value], tree)
        return branchAppendEnd(childT, branch)
    } else if (child && child.length > 1) {
        const childTArray = child.map(item => treetoBranch(item))
        const branchChild = _makeBranch('multi', childTArray, {} )
        return _makeBranch('branch', [tree.value].concat(branchChild), tree)
    } else {
        return _makeBranch('branch', [tree.value], tree)
    }
}

export function treeAdd(tree, path) {
    let currentLevel = tree;
    const branch = path.IDs

    for (const node of branch) {
        // Vérifier si le noeud existe déjà
        let existingNode = currentLevel.child.find(child => child.value === node);

        if (!existingNode) {
            // Si le noeud n'existe pas, l'ajouter
            existingNode = { value: node, child: [] };
            currentLevel.child.push(existingNode);
        }

        // Descendre d'un niveau
        currentLevel = existingNode;
    }
}

function _makeTree(value, child, branch) {
    const repetition = branch.repetition
    const disable = branch.flags && branch.flags.indexOf('disable') > -1
    const shift   = branch.shift
    return { value: value, 
        child: child, 
        ...(repetition && { repetition: repetition }), 
        ...(disable && { disable }),
        ...(shift && { shift })
    }
}

export function _makeBranch(type, value, tree) {
    const {repetition, disable, shift, chaque} = tree;
    const flags = []
    if (disable) { flags.push('disable') }
    if (chaque) { flags.push('chaque') }
    return { type: type, value: value, 
        ...( repetition && { repetition }), 
        ...( flags.length > 0 && { flags }),
        ...( shift && { shift: shift})
    }
}

