export default class Utils {

    static enumToString(enumType, value) {
        for (var k in enumType)
            if (enumType[k] == value) {
                return k;
            }
        return null;
    }

    static randomArr(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
}