using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using NemetschekDnevnik.Server.Models;

namespace NemetschekDnevnik.Server.Controllers
{

	public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
    [ApiController]
    [Route("[controller]")]
    public class LoginController : ControllerBase
    {
        private readonly SignInManager<User> _signin;
        public LoginController(SignInManager<User> signin)
        {
            _signin = signin;
        }
        
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] LoginDto request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest("Email and password are required.");
            }

            // TODO: Authenticate user
            var result = await _signin.PasswordSignInAsync(request.Email, request.Password, isPersistent: true, lockoutOnFailure: false);
            
            if(result.Succeeded) return Ok(new { message = "Logged in successfully!" });

            return BadRequest("Wrong login.");
        }
    }
}
