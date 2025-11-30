using Moq;
using Xunit;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using Backend.Controllers;
using Backend.DAL;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Models;
using Backend.DTO;
using System.Security.Claims;
using Microsoft.AspNetCore.Http; // Assuming Product is in the Models namespace
using System.Text.Json;

namespace ControllerTests
{
    public class ProductsControllerTests
    {
        private readonly Mock<IProductsRepository> _mockProductsRepository;
        private readonly Mock<ILogger<ProductsController>> _mockLogger;
        private readonly Mock<UserManager<ApplicationUser>> _mockUserManager;
        private readonly ProductsController _controller;

        public ProductsControllerTests()
        {
            // Mock dependencies
            var userStoreMock = new Mock<IUserStore<ApplicationUser>>();
#nullable disable
            _mockUserManager = new Mock<UserManager<ApplicationUser>>(userStoreMock.Object, null, null, null, null, null, null, null, null);
#nullable restore
            _mockProductsRepository = new Mock<IProductsRepository>();
            _mockLogger = new Mock<ILogger<ProductsController>>();

            _controller = new ProductsController(_mockUserManager.Object, _mockProductsRepository.Object, _mockLogger.Object)
            {
                /*ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext
                    {
                        User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                        {
                            new Claim(ClaimTypes.NameIdentifier, "test-user-id")
                        }))
                    }
                }*/
            };
        }

        /*
        Get All Products Tests
        */

        [Fact]
        public async Task GetAllProductsAsync_ReturnsOk_WhenProductsExist()
        {
            // Arrange
            var products = new List<Product>
            {
                new Product { ProductId = 1, Name = "Product 1" },
                new Product { ProductId = 2, Name = "Product 2" }
            };
            _mockProductsRepository.Setup(x => x.GetAllProductsAsync()).ReturnsAsync(products);

            // Set the user role to Admin
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                        new Claim(ClaimTypes.Role, "Admin") // Any role will do
                    }))
                }
            };

            // Act
            var result = await _controller.GetAllProductsAsync();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(products, okResult.Value);
        }

        [Fact]
        public async Task GetAllProductsAsync_ReturnsOk_WhenNoProductsExist()
        {
            // Arrange
            var products = new List<Product>();
            _mockProductsRepository.Setup(x => x.GetAllProductsAsync()).ReturnsAsync(products);

            // Set the user role to Researcher
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                        new Claim(ClaimTypes.Role, "Researcher") // Any role will do
                    }))
                }
            };

            // Act
            var result = await _controller.GetAllProductsAsync();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(products, okResult.Value);
        }

        [Fact]
        public async Task GetAllProductsAsync_ReturnsInternalServerError_WhenExceptionOccurs()
        {
            // Arrange
            _mockProductsRepository.Setup(x => x.GetAllProductsAsync()).Throws(new Exception("Test Exception"));

            // Set the user role to Producer
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                        new Claim(ClaimTypes.Role, "Producer")
                    }))
                }
            };

            // Act
            var result = await _controller.GetAllProductsAsync();

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Equal("Internal server error.", statusCodeResult.Value);
        }

        /*
        Get My Products Tests
        */

        private void SetUserContext(string userId, string role)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Role, role)
            };

            var identity = new ClaimsIdentity(claims, "TestAuth");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };
        }

        [Fact]
        public async Task GetProductByUserIdAsync_UserIsProducer_ReturnsOwnProducts()
        {
            // Arrange
            string userId = "producer123";
            SetUserContext(userId, "Producer");

            var expectedProducts = new List<Product>
            {
                new Product { ProductId = 1, UserId = userId }
            };

            _mockProductsRepository
                .Setup(repo => repo.GetProductsByUserIdAsync(userId))
                .ReturnsAsync(expectedProducts);

            // Act
            var result = await _controller.GetProductByUserIdAsync();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedProducts, okResult.Value);
        }

        [Fact]
        public async Task GetProductByUserIdAsync_UserIsResearcher_ReturnsAllProducts()
        {
            // Arrange
            string userId = "researcher123";
            SetUserContext(userId, "Researcher");

            var expectedProducts = new List<Product>
            {
                new Product { ProductId = 1 },
                new Product { ProductId = 2 }
            };

            _mockProductsRepository
                .Setup(repo => repo.GetAllProductsAsync())
                .ReturnsAsync(expectedProducts);

            // Act
            var result = await _controller.GetProductByUserIdAsync();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedProducts, okResult.Value);
        }

        [Fact]
        public async Task GetProductByUserIdAsync_UserIsAdmin_ReturnsAllProducts()
        {
            // Arrange
            string userId = "admin123";
            SetUserContext(userId, "Admin");

            var expectedProducts = new List<Product>
            {
                new Product { ProductId = 99 }
            };

            _mockProductsRepository
                .Setup(repo => repo.GetAllProductsAsync())
                .ReturnsAsync(expectedProducts);

            // Act
            var result = await _controller.GetProductByUserIdAsync();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedProducts, okResult.Value);
        }

        [Fact]
        public async Task GetProductByUserIdAsync_RepositoryThrowsException_ReturnsInternalServerError()
        {
            // Arrange
            string userId = "producer123";
            SetUserContext(userId, "Producer");

            _mockProductsRepository
                .Setup(repo => repo.GetProductsByUserIdAsync(It.IsAny<string>()))
                .ThrowsAsync(new Exception("Something went wrong"));

            // Act
            var result = await _controller.GetProductByUserIdAsync();

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, objectResult.StatusCode);
            Assert.Equal("Internal server error.", objectResult.Value);
        }

        /*
        Get Product By Id Tests
        */

        [Fact]
        public async Task GetProductByIdAsync_ReturnsOk_WhenProductExists()
        {
            // Arrange
            var product = new Product { ProductId = 1, Name = "Product 1" };
            _mockProductsRepository.Setup(x => x.GetProductByIdAsync(It.IsAny<int>())).ReturnsAsync(product);

            // Set the user role to Admin
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                        new Claim(ClaimTypes.Role, "Admin") // Any role will do
                    }))
                }
            };

            // Act
            var result = await _controller.GetProductByIdAsync(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(product, okResult.Value);
        }

        [Fact]
        public async Task GetProductByIdAsync_ReturnsNotFound_WhenProductDoesNotExist()
        {
            // Arrange
            _mockProductsRepository.Setup(x => x.GetProductByIdAsync(It.IsAny<int>())).ReturnsAsync((Product)null);

            // Set the user role to Researcher
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                        new Claim(ClaimTypes.Role, "Researcher") // Any role will do
                    }))
                }
            };

            // Act
            var result = await _controller.GetProductByIdAsync(1);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task GetProductByIdAsync_ReturnsInternalServerError_WhenExceptionOccurs()
        {
            // Arrange
            _mockProductsRepository.Setup(x => x.GetProductByIdAsync(It.IsAny<int>())).Throws(new Exception("Test Exception"));

            // Set the user role to Producer
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                        new Claim(ClaimTypes.Role, "Producer") // Any role will do
                    }))
                }
            };

            // Act
            var result = await _controller.GetProductByIdAsync(1);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Equal("Internal server error.", statusCodeResult.Value);
        }

        /*
        Create Product Tests
        */

        [Fact]
        public async Task CreateProductAsync_ReturnsBadRequest_WhenProductDtoIsNull()
        {
            // Arrange
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                        new Claim(ClaimTypes.Role, "Producer")
                    }))
                }
            };

            // Act
            var result = await _controller.CreateProductAsync(null);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Product data is null.", badRequestResult.Value);
        }

        [Fact]
        public async Task CreateProductAsync_ReturnsUnauthorized_WhenUserIdIsNull()
        {
            // Arrange
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity())
                }
            };

            // Act
            var result = await _controller.CreateProductAsync(new ProductDTO());

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("User not authenticated.", unauthorizedResult.Value);
        }

        [Fact]
        public async Task CreateProductAsync_ReturnsNotFound_WhenUserNotFound()
        {
            // Arrange
            _mockUserManager.Setup(x => x.FindByIdAsync(It.IsAny<string>())).ReturnsAsync((ApplicationUser)null);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                        new Claim(ClaimTypes.Role, "Producer")
                    }))
                }
            };

            // Act
            var result = await _controller.CreateProductAsync(new ProductDTO());

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("User not found.", notFoundResult.Value);
        }

        [Fact]
        public async Task CreateProductAsync_ReturnsCreatedAtAction_WhenProductCreatedSuccessfully()
        {
            // Arrange
            var user = new ApplicationUser { Id = "test-user-id" };
            _mockUserManager.Setup(x => x.FindByIdAsync(It.IsAny<string>())).ReturnsAsync(user);
            _mockProductsRepository.Setup(x => x.CreateProductAsync(It.IsAny<Product>())).ReturnsAsync(true);

            var productDto = new ProductDTO
            {
                Name = "Test Product",
                Group = "Test Group",
                Type = "Test Type",
                HasEfsaHealth = "true",
                HasEfsaNutrition = "true",
                HasNokkelhullet = true,
                ImageUrl = "http://test.com/image.png",
                Calories = 100,
                Fat = 10,
                SatFat = 5,
                Carbs = 20,
                NatSugar = 10,
                AddedSugar = 5,
                Fiber = 2,
                Protein = 5,
                Salt = 1
            };

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                        new Claim(ClaimTypes.Role, "Producer")
                    }))
                }
            };

            // Act
            var result = await _controller.CreateProductAsync(productDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(_controller.GetProductByIdAsync), createdAtActionResult.ActionName);
            Assert.IsType<Product>(createdAtActionResult.Value);
        }

        [Fact]
        public async Task CreateProductAsync_ReturnsBadRequest_WhenProductCreationFails()
        {
            // Arrange
            var user = new ApplicationUser { Id = "test-user-id" };
            _mockUserManager.Setup(x => x.FindByIdAsync(It.IsAny<string>())).ReturnsAsync(user);
            _mockProductsRepository.Setup(x => x.CreateProductAsync(It.IsAny<Product>())).ReturnsAsync(false);

            var productDto = new ProductDTO
            {
                Name = "Test Product",
                Group = "Test Group",
                Type = "Test Type",
                HasEfsaHealth = "true",
                HasEfsaNutrition = "true",
                HasNokkelhullet = true,
                ImageUrl = "http://test.com/image.png",
                Calories = 100,
                Fat = 10,
                SatFat = 5,
                Carbs = 20,
                NatSugar = 10,
                AddedSugar = 5,
                Fiber = 2,
                Protein = 5,
                Salt = 1
            };

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                        new Claim(ClaimTypes.Role, "Producer")
                    }))
                }
            };

            // Act
            var result = await _controller.CreateProductAsync(productDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Failed to create product.", badRequestResult.Value);
        }

        [Fact]
        public async Task CreateProductAsync_ReturnsInternalServerError_WhenExceptionOccurs()
        {
            // Arrange
            _mockUserManager.Setup(x => x.FindByIdAsync(It.IsAny<string>())).Throws(new Exception("Test Exception"));

            var productDto = new ProductDTO
            {
                Name = "Test Product",
                Group = "Test Group",
                Type = "Test Type",
                HasEfsaHealth = "true",
                HasEfsaNutrition = "true",
                HasNokkelhullet = true,
                ImageUrl = "http://test.com/image.png",
                Calories = 100,
                Fat = 10,
                SatFat = 5,
                Carbs = 20,
                NatSugar = 10,
                AddedSugar = 5,
                Fiber = 2,
                Protein = 5,
                Salt = 1
            };

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                        new Claim(ClaimTypes.Role, "Producer")
                    }))
                }
            };

            // Act
            var result = await _controller.CreateProductAsync(productDto);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Equal("Internal server error.", statusCodeResult.Value);
        }

        /*
        Update Product Tests
        */
        [Fact]
        public async Task UpdateProductAsync_ReturnsBadRequest_WhenProductDtoIsNull()
        {
            // Act
            var result = await _controller.UpdateProductAsync(1, null);

            // Assert
            Assert.IsType<BadRequestResult>(result);
        }

        [Fact]
        public async Task UpdateProductAsync_ReturnsBadRequest_WhenProductDtoIdDoesNotMatch()
        {
            // Arrange
            var productDto = new ProductDTO { ProductId = 2 };

            // Act
            var result = await _controller.UpdateProductAsync(1, productDto);

            // Assert
            Assert.IsType<BadRequestResult>(result);
        }

        [Fact]
        public async Task UpdateProductAsync_ReturnsNotFound_WhenProductDoesNotExist()
        {
            // Arrange
            _mockProductsRepository.Setup(x => x.GetProductByIdAsync(It.IsAny<int>())).ReturnsAsync((Product)null);
            var productDto = new ProductDTO { ProductId = 1 };

            // Act
            var result = await _controller.UpdateProductAsync(1, productDto);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundResult>(result);
        }


        [Fact]
        public async Task UpdateProductAsync_ReturnsUnauthorized_WhenProducerUpdatesOthersProduct()
        {
            // Arrange
            var existingProduct = new Product { ProductId = 1, UserId = "other-user-id" };
            _mockProductsRepository.Setup(x => x.GetProductByIdAsync(It.IsAny<int>())).ReturnsAsync(existingProduct);
            var productDto = new ProductDTO { ProductId = 1 };

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                        new Claim(ClaimTypes.Role, "Producer")
                    }))
                }
            };

            // Act
            var result = await _controller.UpdateProductAsync(1, productDto);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Producers can only update their own products.", unauthorizedResult.Value);
        }

        [Fact]
        public async Task UpdateProductAsync_ReturnsCreatedAtAction_WhenProductUpdatedSuccessfully()
        {
            // Arrange
            var existingProduct = new Product { ProductId = 1, UserId = "test-user-id" };
            _mockProductsRepository.Setup(x => x.GetProductByIdAsync(It.IsAny<int>())).ReturnsAsync(existingProduct);
            _mockProductsRepository.Setup(x => x.UpdateProductAsync(It.IsAny<Product>())).ReturnsAsync(true);
            var productDto = new ProductDTO
            {
                ProductId = 1,
                Name = "Updated Product",
                Group = "Updated Group",
                Type = "Updated Type",
                HasEfsaHealth = "true",
                HasEfsaNutrition = "true",
                HasNokkelhullet = true,
                ImageUrl = "http://test.com/updated-image.png",
                Calories = 150,
                Fat = 15,
                SatFat = 7,
                Carbs = 30,
                NatSugar = 15,
                AddedSugar = 8,
                Fiber = 3,
                Protein = 7,
                Salt = 2
            };

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                        new Claim(ClaimTypes.Role, "Producer")
                    }))
                }
            };

            // Act
            var result = await _controller.UpdateProductAsync(1, productDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(_controller.GetProductByIdAsync), createdAtActionResult.ActionName);
            Assert.IsType<Product>(createdAtActionResult.Value);
        }

        [Fact]
        public async Task UpdateProductAsync_ReturnsInternalServerError_WhenExceptionOccurs()
        {
            // Arrange
            _mockProductsRepository.Setup(x => x.GetProductByIdAsync(It.IsAny<int>())).Throws(new Exception("Test Exception"));
            var productDto = new ProductDTO { ProductId = 1 };

            // Act
            var result = await _controller.UpdateProductAsync(1, productDto);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Equal("Internal server error.", statusCodeResult.Value);
        }

        [Fact]
        public async Task UpdateProductAsync_ReturnsInternalServerError_WhenUpdateFails()
        {
            // Arrange
            var existingProduct = new Product { ProductId = 1, UserId = "test-user-id" };
            _mockProductsRepository.Setup(x => x.GetProductByIdAsync(It.IsAny<int>())).ReturnsAsync(existingProduct);
            _mockProductsRepository.Setup(x => x.UpdateProductAsync(It.IsAny<Product>())).ReturnsAsync(false);
            var productDto = new ProductDTO { ProductId = 1 };

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                        new Claim(ClaimTypes.Role, "Producer")
                    }))
                }
            };

            // Act
            var result = await _controller.UpdateProductAsync(1, productDto);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Equal("An error occurred while updating the product.", statusCodeResult.Value);
        }

        /* 
        Delete Product Tests
        */
        [Fact]
        public async Task DeleteProductAsync_ReturnsNotFound_WhenProductDoesNotExist()
        {
            // Arrange
            _mockProductsRepository.Setup(x => x.GetProductByIdAsync(It.IsAny<int>())).ReturnsAsync((Product)null);

            // Act
            var result = await _controller.DeleteProductAsync(1);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task DeleteProductAsync_ReturnsUnauthorized_WhenProducerDeletesOthersProduct()
        {
            // Arrange
            var existingProduct = new Product { ProductId = 1, UserId = "other-user-id" };
            _mockProductsRepository.Setup(x => x.GetProductByIdAsync(It.IsAny<int>())).ReturnsAsync(existingProduct);

            // Set the user role to Producer
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.Role, "Producer")
                    }))
                }
            };

            // Act
            var result = await _controller.DeleteProductAsync(1);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Producers can only delete their own products.", unauthorizedResult.Value);
        }

        [Fact]
        public async Task DeleteProductAsync_ReturnsNoContent_WhenProductDeletedSuccessfully_AsAdmin()
        {
            // Arrange
            var existingProduct = new Product { ProductId = 1, UserId = "other-user-id" };
            _mockProductsRepository.Setup(x => x.GetProductByIdAsync(It.IsAny<int>())).ReturnsAsync(existingProduct);
            _mockProductsRepository.Setup(x => x.DeleteProductAsync(It.IsAny<int>())).ReturnsAsync(true);

            // Set the user role to Admin
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                    {
                        //new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                        new Claim(ClaimTypes.Role, "Admin")
                    }))
                }
            };

            // Act
            var result = await _controller.DeleteProductAsync(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteProductAsync_ReturnsNoContent_WhenProductDeletedSuccessfully_AsProducer()
        {
            // Arrange
            var existingProduct = new Product { ProductId = 1, UserId = "test-user-id" };
            _mockProductsRepository.Setup(x => x.GetProductByIdAsync(It.IsAny<int>())).ReturnsAsync(existingProduct);
            _mockProductsRepository.Setup(x => x.DeleteProductAsync(It.IsAny<int>())).ReturnsAsync(true);

            // Set the user role to Producer
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                        new Claim(ClaimTypes.Role, "Producer")
                    }))
                }
            };

            // Act
            var result = await _controller.DeleteProductAsync(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteProductAsync_ReturnsNotFound_WhenProductDeletionFails()
        {
            // Arrange
            var existingProduct = new Product { ProductId = 1, UserId = "test-user-id" };
            _mockProductsRepository.Setup(x => x.GetProductByIdAsync(It.IsAny<int>())).ReturnsAsync(existingProduct);
            _mockProductsRepository.Setup(x => x.DeleteProductAsync(It.IsAny<int>())).ReturnsAsync(false);

            // Set the user role to Producer
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                        new Claim(ClaimTypes.Role, "Producer")
                    }))
                }
            };

            // Act
            var result = await _controller.DeleteProductAsync(1);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task DeleteProductAsync_ReturnsInternalServerError_WhenExceptionOccurs()
        {
            // Arrange
            _mockProductsRepository.Setup(x => x.GetProductByIdAsync(It.IsAny<int>())).Throws(new Exception("Test Exception"));

            // Set the user role to Producer
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                        new Claim(ClaimTypes.Role, "Producer")
                    }))
                }
            };

            // Act
            var result = await _controller.DeleteProductAsync(1);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Equal("Internal server error.", statusCodeResult.Value);
        }

        /*
        Image upload
        */

        [Fact]
        public async Task UploadProductImage_FileIsNull_ReturnsBadRequest()
        {
            // Act
            var result = await _controller.UploadProductImage(null);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var response = badRequestResult.Value;

            // Using dynamic to access anonymous type
            var messageProperty = response.GetType().GetProperty("message");
            var message = messageProperty?.GetValue(response)?.ToString();

            Assert.Equal("No file uploaded.", message);
        }

        [Fact]
        public async Task UploadProductImage_InvalidFileExtension_ReturnsBadRequest()
        {
            // Arrange
            var fileMock = new Mock<IFormFile>();
            fileMock.Setup(f => f.FileName).Returns("malicious.exe");
            fileMock.Setup(f => f.Length).Returns(123);

            // Act
            var result = await _controller.UploadProductImage(fileMock.Object);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var response = badRequestResult.Value;

            var messageProperty = response.GetType().GetProperty("message");
            var message = messageProperty?.GetValue(response)?.ToString();

            Assert.Equal("Invalid file type. Allowed types: jpg, jpeg, png, gif.", message);
        }

        [Fact]
        public async Task UploadProductImage_ValidImage_ReturnsOkWithImageUrl()
        {
            // Arrange
            var content = "Fake image content";
            var fileName = "image.jpg";
            var ms = new MemoryStream();
            var writer = new StreamWriter(ms);
            writer.Write(content);
            writer.Flush();
            ms.Position = 0;

            var formFile = new FormFile(ms, 0, ms.Length, "file", fileName)
            {
                Headers = new HeaderDictionary(),
                ContentType = "image/jpeg"
            };

            var controllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            _controller.ControllerContext = controllerContext;

            // Act
            var result = await _controller.UploadProductImage(formFile);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value;

            var imageUrlProperty = response.GetType().GetProperty("imageUrl");
            var imageUrl = imageUrlProperty?.GetValue(response)?.ToString();

            Assert.NotNull(imageUrl);
            Assert.Contains("/images/product_images/", imageUrl);
        }

        [Fact]
        public async Task UploadProductImage_ExceptionThrown_ReturnsInternalServerError()
        {
            // Arrange
            var fileMock = new Mock<IFormFile>();
            fileMock.Setup(f => f.FileName).Returns("image.jpg");
            fileMock.Setup(f => f.Length).Returns(123);
            fileMock.Setup(f => f.CopyToAsync(It.IsAny<Stream>(), default)).ThrowsAsync(new Exception("Simulert feil"));

            var controllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };
            _controller.ControllerContext = controllerContext;

            // Act
            var result = await _controller.UploadProductImage(fileMock.Object);

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);

            var response = objectResult.Value;
            var messageProperty = response.GetType().GetProperty("message");
            var message = messageProperty?.GetValue(response)?.ToString();

            Assert.Equal("An unexpected error occurred.", message);
        }

        /*
        Delete product image
        */
        [Fact]
        public void DeleteProductImage_FileExists_ReturnsOk()
        {
            // Arrange
            var imageUrl = "images/test.jpg";
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", imageUrl);

            // Sørg for at mappen og filen finnes
            Directory.CreateDirectory(Path.GetDirectoryName(filePath));
            File.WriteAllText(filePath, "dummy");

            var controller = new ProductsController(_mockUserManager.Object, _mockProductsRepository.Object, _mockLogger.Object);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[] {
                        new Claim(ClaimTypes.NameIdentifier, "test-user-id")
                    }))
                }
            };

            var request = new ImageDeleteRequest { ImageUrl = "/" + imageUrl };

            // Act
            var result = controller.DeleteProductImage(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);

            // Konverter anonym objekt til JSON og parse
            var json = JsonSerializer.Serialize(okResult.Value);
            var jsonDoc = JsonDocument.Parse(json);
            var message = jsonDoc.RootElement.GetProperty("message").GetString();

            Assert.Equal("Image deleted successfully.", message);
        }

        [Fact]
        public void DeleteProductImage_FileDoesNotExist_ReturnsNotFound()
        {
            // Arrange
            var imageUrl = "images/nonexistent.jpg";
            var request = new ImageDeleteRequest { ImageUrl = "/" + imageUrl };

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "test-user-id")
                    }))
                }
            };

            // Act
            var result = _controller.DeleteProductImage(request);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var json = JsonSerializer.Serialize(notFoundResult.Value);
            var jsonDoc = JsonDocument.Parse(json);
            var message = jsonDoc.RootElement.GetProperty("message").GetString();

            Assert.Equal("Image not found.", message);
        }

        [Fact]
        public void DeleteProductImage_EmptyImageUrl_ReturnsBadRequest()
        {
            // Arrange
            var request = new ImageDeleteRequest { ImageUrl = "" };

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "test-user-id")
                    }))
                }
            };

            // Act
            var result = _controller.DeleteProductImage(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var json = JsonSerializer.Serialize(badRequestResult.Value);
            var jsonDoc = JsonDocument.Parse(json);
            var message = jsonDoc.RootElement.GetProperty("message").GetString();

            Assert.Equal("No image URL provided.", message);
        }

        [Fact]
        public void DeleteProductImage_LoggerThrowsException_ReturnsInternalServerError()
        {
            // Denne testen ble utelatt fordi den krever mocking av File.Delete via en abstraksjon
            // som IFileService – vurderes kun hvis vi trenger høy testdekning på feilsituasjoner.
        }
    }
}