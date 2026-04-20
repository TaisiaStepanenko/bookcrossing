import City from "../models/City";
import Region from "../models/Region";

export const cityRepository = {

    async findAll(): Promise<City[]> {
        return City.findAll({
            attributes: ['city_id', 'name'],
            order: [['name', 'ASC']],
            include: [
                {
                    model: Region,
                    attributes: ['region_id', 'name']
                }
            ]
        });
    },

    async findCityById(city_id: number): Promise<City | null> {
        return City.findByPk(city_id);
    }, 

    async getCitiesByRegion(city_id: number): Promise<number[]> {
        const userCity = await City.findByPk(city_id);

        const citiesInRegion = await City.findAll({
            where: { region_id: userCity?.region_id },
            attributes: ['city_id']
        });

        return citiesInRegion.map(c => c.city_id);
    }
}