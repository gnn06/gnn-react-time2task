export function mapProperties(obj1, mapping) {
    function foo(obj1, prop1, obj2, prop2) {
        if (obj1[prop1]) {
            obj2[prop2] = obj1[prop1]
        }
    }
    const obj2 = {}
    mapping.forEach(m => foo(obj1, m.old, obj2, m.new))
    return obj2
};
