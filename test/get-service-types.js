/**
 * Get Service Types for Testing
 */

async function getServiceTypes() {
  try {
    const response = await fetch('http://localhost:3000/api/service-types')
    const data = await response.json()
    
    if (data.success) {
      console.log('Available Service Types:')
      data.data.forEach(service => {
        console.log(`- ${service.name} (${service.type}): ${service.id}`)
      })
      
      // Return the first kiloan service
      const kiloanService = data.data.find(s => s.type === 'kiloan')
      return kiloanService || data.data[0]
    }
    
    return null
  } catch (error) {
    console.error('Error fetching service types:', error)
    return null
  }
}

getServiceTypes()
