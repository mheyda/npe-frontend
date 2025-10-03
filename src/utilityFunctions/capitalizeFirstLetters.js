// Takes a string and returns the first letter in each word capitalized
export default function capitalizeFirstLetters(string) {
    try {
        return string.split(" ").map((word) => word[0].toUpperCase() + word.substr(1).toLowerCase() + ' ');
    } catch (error) {
        return string;
    }
}