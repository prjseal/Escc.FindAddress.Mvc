﻿// Build this file in debug only as it's for local testing, but we don't want it to be included in the NuGet package
#if DEBUG
using System.Web.Mvc;

namespace Escc.FindAddress.Mvc.Test
{
    public class TestController : Controller
    {
        // GET: Test
        public ActionResult Index()
        {
            return View(new TestModel());
        }

        [HttpPost]
        public ActionResult SubmitTest(TestModel model)
        {
            return new HttpStatusCodeResult(200);
        }
    }
}
#endif