public class EnsureApprovedUserMiddleware
{
    private readonly RequestDelegate _next;
    
    public EnsureApprovedUserMiddleware(RequestDelegate next)
    {
        _next = next;
    }
}