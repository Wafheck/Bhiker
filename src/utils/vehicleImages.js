// Centralized vehicle image mappings
// Import all vehicle images
import honda_activa from "../vehicles/honda_activa.jpg";
import tvs_apache from "../vehicles/tvs_apache.jpg";
import hero_splendor from "../vehicles/hero_splendor.png";
import bajaj_pulsar from "../vehicles/bajaj_pulsar.jpg";
import suzuki_access from "../vehicles/suzuki_access.jpg";
import placeholder from "../vehicles/addlist_placeholder.png";

// Map model names to their images
export const modelImageMap = {
    honda_activa: honda_activa,
    tvs_apache: tvs_apache,
    hero_splendor: hero_splendor,
    bajaj_pulsar: bajaj_pulsar,
    suzuki_access: suzuki_access,
};

// Default placeholder image
export const placeholderImage = placeholder;

// Helper function to get image for a model
export function getVehicleImage(modelName) {
    return modelImageMap[modelName] || placeholderImage;
}
