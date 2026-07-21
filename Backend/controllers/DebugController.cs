using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TesteMaxi.controllers;

[ApiController]
[Route("api/debug")]
public class DebugController : ControllerBase
{
    [HttpGet("whoami")]
    public IActionResult WhoAmI()
    {
        if (!User.Identity?.IsAuthenticated ?? false)
            return Unauthorized(new { message = "No authenticated user." });

        var claims = User.Claims.Select(c => new { c.Type, c.Value });

        return Ok(new
        {
            authenticated = true,
            name = User.Identity?.Name,
            claims
        });
    }
}
