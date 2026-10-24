package com.hcl.retail_inventory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hcl.retail_inventory.controller.AuthController.RegisterRequest;
import com.hcl.retail_inventory.entity.*;
import com.hcl.retail_inventory.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
class ApiEndpointsIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
            .disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    private MockMvc mockMvc;
    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        orderRepository.deleteAll();
        purchaseOrderRepository.deleteAll();
        inventoryRepository.deleteAll();
        productRepository.deleteAll();
        customerRepository.deleteAll();
        warehouseRepository.deleteAll();
        supplierRepository.deleteAll();
        userRepository.deleteAll();

        // Create initial admin
        RegisterRequest adminReq = new RegisterRequest("System Admin", "sysadmin@retail.com", "AdminPass123");
        MvcResult res = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminReq)))
                .andExpect(status().isCreated())
                .andReturn();

        adminToken = objectMapper.readTree(res.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    @DisplayName("Product CRUD: Admin can create, read, update, delete products")
    void testProductCrud() throws Exception {
        Product product = new Product("SKU-LAP-001", "Gaming Laptop", "Fast laptop", "Electronics", "BrandX", 1299.99, 999.99, "pcs", ProductStatus.ACTIVE);

        // 1. Create
        MvcResult createResult = mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(product)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.sku").value("SKU-LAP-001"))
                .andReturn();

        Long prodId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        // 2. Read All & Read By Id
        mockMvc.perform(get("/api/products")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(get("/api/products/" + prodId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Gaming Laptop"));

        // 3. Update
        product.setName("Gaming Laptop Pro");
        product.setPrice(1399.99);
        mockMvc.perform(put("/api/products/" + prodId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(product)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Gaming Laptop Pro"))
                .andExpect(jsonPath("$.price").value(1399.99));

        // 4. Delete
        mockMvc.perform(delete("/api/products/" + prodId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/products/" + prodId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Customer & Order Flow: Create customer, place order with items, verify order cascade")
    void testCustomerAndOrderFlow() throws Exception {
        // Create Product
        Product product = productRepository.save(new Product("SKU-MOUSE-1", "Wireless Mouse", "Ergonomic mouse", "Peripherals", "TechPro", 29.99, 15.0, "pcs", ProductStatus.ACTIVE));

        // Create Customer
        Customer customer = new Customer("John Doe", "john.doe@example.com", "9876543210", "123 Main St", "Bangalore", "Karnataka", "560001", "India");
        MvcResult custResult = mockMvc.perform(post("/api/customers")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(customer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andReturn();

        Long custId = objectMapper.readTree(custResult.getResponse().getContentAsString()).get("id").asLong();
        customer.setId(custId);

        // Create Order
        Order order = new Order();
        order.setCustomer(customer);
        order.setTotalAmount(59.98);
        order.setShippingAddress("123 Main St");
        order.setShippingCity("Bangalore");
        order.setShippingState("Karnataka");
        order.setShippingPincode("560001");

        OrderItem item = new OrderItem(product, 2, 29.99, 59.98);
        order.setOrderItems(List.of(item));

        MvcResult orderResult = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(order)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.orderNumber").isNotEmpty())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn();

        Long orderId = objectMapper.readTree(orderResult.getResponse().getContentAsString()).get("id").asLong();

        // Read Order
        mockMvc.perform(get("/api/orders/" + orderId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAmount").value(59.98))
                .andExpect(jsonPath("$.orderItems.length()").value(1));
    }

    @Test
    @DisplayName("Warehouse, Supplier & Inventory Flow: Manage stock and supplier relations")
    void testWarehouseSupplierInventoryFlow() throws Exception {
        // Create Warehouse
        Warehouse warehouse = new Warehouse("WH-BLR-01", "Bengaluru Central", "Main Hub", "Industrial Area", "Bangalore", "Karnataka", "560099", "India", "Ravi Kumar", "9876543211", "ravi@wh.com", 50000, WarehouseStatus.ACTIVE);
        MvcResult whResult = mockMvc.perform(post("/api/warehouses")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(warehouse)))
                .andExpect(status().isOk())
                .andReturn();
        Long whId = objectMapper.readTree(whResult.getResponse().getContentAsString()).get("id").asLong();
        warehouse.setId(whId);

        // Create Supplier
        Supplier supplier = new Supplier("Apex Electronics", "contact@apex.com", "9876543212", "Tech Park", "Hyderabad", "Telangana", "500081", "India", "Suresh Mehta", SupplierStatus.ACTIVE);
        MvcResult supResult = mockMvc.perform(post("/api/suppliers")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(supplier)))
                .andExpect(status().isOk())
                .andReturn();
        Long supId = objectMapper.readTree(supResult.getResponse().getContentAsString()).get("id").asLong();
        supplier.setId(supId);

        // Create Product
        Product product = productRepository.save(new Product("SKU-KB-1", "Mechanical Keyboard", "RGB Gaming", "Peripherals", "Keytron", 79.99, 45.0, "pcs", ProductStatus.ACTIVE));

        // Create Inventory Stock
        Inventory inventory = new Inventory(product, warehouse, 100, 10, 20);
        MvcResult invResult = mockMvc.perform(post("/api/inventory")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inventory)))
                .andExpect(status().isOk())
                .andReturn();
        Long invId = objectMapper.readTree(invResult.getResponse().getContentAsString()).get("id").asLong();

        // Check availability
        mockMvc.perform(get("/api/inventory/" + invId + "/availability")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(content().string("Available"));

        // Create Purchase Order
        PurchaseOrder po = new PurchaseOrder();
        po.setSupplier(supplier);
        po.setTotalAmount(2250.0);
        PurchaseOrderItem poItem = new PurchaseOrderItem(product, 50, 45.0, 2250.0);
        po.setPurchaseOrderItems(List.of(poItem));

        mockMvc.perform(post("/api/purchase-orders")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(po)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.purchaseOrderNumber").isNotEmpty())
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @DisplayName("Data Integrity: Duplicate SKU rejected with 409 Conflict without leaking raw SQL")
    void testDuplicateSkuHandling() throws Exception {
        Product product1 = new Product("SKU-DUP-001", "Item One", "Desc", "Category", "Brand", 10.0, 5.0, "pcs", ProductStatus.ACTIVE);
        mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(product1)))
                .andExpect(status().isOk());

        Product product2 = new Product("SKU-DUP-001", "Item Two", "Desc", "Category", "Brand", 20.0, 10.0, "pcs", ProductStatus.ACTIVE);
        mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(product2)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Database constraint violation: record may already exist or required relations are missing"));
    }
}
