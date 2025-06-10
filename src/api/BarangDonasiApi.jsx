import useAxios from ".";

// Get all donated items (with status "Barang sudah Didonasikan")
export const getAllDonatedItems = async () => {
  try {
    const response = await useAxios.get('/barang', {
      params: { status: 'Barang sudah Didonasikan' }
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error fetching donated items:", error);
    throw error;
  }
};

// Get detailed info for a specific donated item
export const getDonatedItemDetail = async (id) => {
  try {
    // Include full relationship data in the request
    const response = await useAxios.get(`/barang/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching donated item ${id}:`, error);
    throw error;
  }
};

// Get donated items with allocation details
export const getAllDonatedItemsWithAllocations = async () => {
  try {
    // Request all items with their relationships fully loaded
    const response = await useAxios.get('/barang');
    const allItems = response.data;
    
    console.log("All items:", allItems);
    
    // Filter items with status "Barang sudah Didonasikan"
    const donatedItems = allItems.filter(item => 
      item.status_barang === 'Barang sudah Didonasikan'
    );
    
    // Log the first item to inspect its structure
    if (donatedItems.length > 0) {
      console.log("Sample donated item structure:", donatedItems[0]);
      console.log("Penitip info:", donatedItems[0].penitipanBarang?.penitip);
    }
    
    return donatedItems;
  } catch (error) {
    console.error("Error fetching donated items with allocations:", error);
    throw error;
  }
};

// Search donated items by name
export const searchDonatedItemsByName = async (keyword) => {
  try {
    const response = await useAxios.get('/barang/search', {
      params: { nama_barang: keyword }
    });
    
    // Filter for only donated items from search results
    const searchResults = response.data.data || response.data;
    return searchResults.filter(item => item.status_barang === 'Barang sudah Didonasikan');
  } catch (error) {
    console.error("Error searching donated items:", error);
    throw error;
  }
};
