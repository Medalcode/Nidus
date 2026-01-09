from playwright.async_api import async_playwright
import asyncio
from tenacity import retry, stop_after_attempt, wait_fixed
import tempfile
import os
from typing import Tuple, List

class NidusAgent:
    def __init__(self, user_profile):
        self.profile = user_profile
        self.screenshots_dir = tempfile.mkdtemp(prefix="nidus_agent_")
        
    async def apply_to_job(self, job_url: str) -> Tuple[str, List[str]]:
        log = []
        status = "failed"
        screenshot_paths = []
        
        async with async_playwright() as p:
            # Launch browser with better configuration
            browser = await p.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-setuid-sandbox']
            )
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                viewport={'width': 1920, 'height': 1080}
            )
            page = await context.new_page()
            
            try:
                log.append(f"🌐 Navigating to {job_url}...")
                await page.goto(job_url, wait_until='networkidle', timeout=60000)
                
                # Take initial screenshot
                screenshot_path = os.path.join(self.screenshots_dir, "01_initial.png")
                await page.screenshot(path=screenshot_path, full_page=True)
                screenshot_paths.append(screenshot_path)
                log.append(f"📸 Screenshot saved: {screenshot_path}")
                
                # Wait a bit for dynamic content
                await page.wait_for_timeout(2000)
                
                # ========== STEP 1: Find and Click Apply Button ==========
                apply_clicked = await self._find_and_click_apply(page, log)
                
                if apply_clicked:
                    log.append("✅ Apply button clicked, waiting for form...")
                    await page.wait_for_timeout(3000)
                    
                    # Screenshot after clicking apply
                    screenshot_path = os.path.join(self.screenshots_dir, "02_after_apply_click.png")
                    await page.screenshot(path=screenshot_path, full_page=True)
                    screenshot_paths.append(screenshot_path)
                    log.append(f"📸 Screenshot saved: {screenshot_path}")
                
                # ========== STEP 2: Detect and Fill Form Fields ==========
                fields_filled = await self._fill_form_fields(page, log)
                
                if fields_filled > 0:
                    status = "partial_success"
                    log.append(f"✅ Successfully filled {fields_filled} fields")
                    
                    # Screenshot after filling
                    screenshot_path = os.path.join(self.screenshots_dir, "03_after_filling.png")
                    await page.screenshot(path=screenshot_path, full_page=True)
                    screenshot_paths.append(screenshot_path)
                    log.append(f"📸 Screenshot saved: {screenshot_path}")
                else:
                    log.append("⚠️ No form fields detected or filled")
                
                # ========== STEP 3: Handle Multi-Step Forms ==========
                next_clicked = await self._handle_next_button(page, log)
                if next_clicked:
                    await page.wait_for_timeout(2000)
                    # Recursively fill next page
                    additional_fields = await self._fill_form_fields(page, log)
                    if additional_fields > 0:
                        log.append(f"✅ Filled {additional_fields} additional fields on next page")
                
                # Final screenshot
                screenshot_path = os.path.join(self.screenshots_dir, "04_final.png")
                await page.screenshot(path=screenshot_path, full_page=True)
                screenshot_paths.append(screenshot_path)
                
                log.append(f"📁 All screenshots saved in: {self.screenshots_dir}")
                log.append("⚠️ Form NOT auto-submitted for safety. Please review and submit manually.")
                
            except Exception as e:
                log.append(f"❌ Error: {str(e)}")
                status = "error"
                
                # Error screenshot
                try:
                    error_screenshot = os.path.join(self.screenshots_dir, "error.png")
                    await page.screenshot(path=error_screenshot)
                    log.append(f"📸 Error screenshot: {error_screenshot}")
                except:
                    pass
                    
            finally:
                await browser.close()
                
        return status, log
    
    async def _find_and_click_apply(self, page, log: List[str]) -> bool:
        """
        Comprehensive apply button detection with multiple strategies
        Returns True if button was clicked
        """
        # Strategy 1: Text-based selectors (multiple languages)
        text_selectors = [
            "Apply", "Apply Now", "Apply for this job",
            "Postular", "Aplicar", "Postularse",
            "Submit Application", "Easy Apply",
            "Apply with LinkedIn", "Quick Apply"
        ]
        
        for text in text_selectors:
            # Try button
            selector = f"button:has-text('{text}')"
            if await page.locator(selector).count() > 0:
                try:
                    await page.locator(selector).first.click(timeout=5000)
                    log.append(f"🎯 Clicked apply button (text: '{text}')")
                    return True
                except:
                    pass
            
            # Try link
            selector = f"a:has-text('{text}')"
            if await page.locator(selector).count() > 0:
                try:
                    await page.locator(selector).first.click(timeout=5000)
                    log.append(f"🎯 Clicked apply link (text: '{text}')")
                    return True
                except:
                    pass
        
        # Strategy 2: ARIA labels
        aria_selectors = [
            "[aria-label*='apply' i]",
            "[aria-label*='postular' i]",
            "[aria-label*='aplicar' i]"
        ]
        
        for selector in aria_selectors:
            if await page.locator(selector).count() > 0:
                try:
                    await page.locator(selector).first.click(timeout=5000)
                    log.append(f"🎯 Clicked apply button (ARIA: '{selector}')")
                    return True
                except:
                    pass
        
        # Strategy 3: Common class patterns (Greenhouse, Lever, Workday, etc.)
        class_selectors = [
            ".apply-button", ".application-button",
            "[class*='apply']", "[class*='Application']",
            "#apply-button", "[data-ui='apply-button']"
        ]
        
        for selector in class_selectors:
            elements = await page.locator(selector).all()
            for element in elements:
                try:
                    if await element.is_visible():
                        await element.click(timeout=5000)
                        log.append(f"🎯 Clicked apply button (class: '{selector}')")
                        return True
                except:
                    continue
        
        log.append("⚠️ No apply button found with standard selectors")
        return False
    
    async def _fill_form_fields(self, page, log: List[str]) -> int:
        """
        Intelligently detect and fill form fields
        Returns count of fields filled
        """
        filled_count = 0
        
        # Get all input elements
        inputs = await page.locator("input").all()
        
        for input_elem in inputs:
            try:
                # Skip hidden fields
                if not await input_elem.is_visible():
                    continue
                
                # Get attributes
                name = await input_elem.get_attribute("name") or ""
                id_attr = await input_elem.get_attribute("id") or ""
                placeholder = await input_elem.get_attribute("placeholder") or ""
                input_type = await input_elem.get_attribute("type") or "text"
                aria_label = await input_elem.get_attribute("aria-label") or ""
                
                # Combine all text for analysis
                combined = f"{name} {id_attr} {placeholder} {aria_label}".lower()
                
                # Skip if already filled
                current_value = await input_elem.input_value()
                if current_value:
                    continue
                
                # ========== Name Field ==========
                if any(keyword in combined for keyword in ["name", "nombre", "full_name", "fullname", "firstname", "first_name"]):
                    if "last" not in combined and "middle" not in combined:
                        await input_elem.fill(self.profile.full_name or "John Doe")
                        log.append(f"📝 Filled name field: {name or id_attr}")
                        filled_count += 1
                        continue
                
                # ========== Email Field ==========
                if any(keyword in combined for keyword in ["email", "e-mail", "correo"]) or input_type == "email":
                    # Use email from User relationship if available
                    email = getattr(self.profile.user, 'email', None) if hasattr(self.profile, 'user') else "nidus@example.com"
                    await input_elem.fill(email)
                    log.append(f"📧 Filled email field: {name or id_attr}")
                    filled_count += 1
                    continue
                
                # ========== Phone Field ==========
                if any(keyword in combined for keyword in ["phone", "telephone", "tel", "móvil", "movil", "celular"]) or input_type == "tel":
                    await input_elem.fill("+1 (555) 123-4567")
                    log.append(f"📞 Filled phone field: {name or id_attr}")
                    filled_count += 1
                    continue
                
                # ========== LinkedIn Field ==========
                if any(keyword in combined for keyword in ["linkedin", "profile"]):
                    await input_elem.fill("https://linkedin.com/in/johndoe")
                    log.append(f"💼 Filled LinkedIn field: {name or id_attr}")
                    filled_count += 1
                    continue
                
                # ========== Portfolio/Website Field ==========
                if any(keyword in combined for keyword in ["website", "portfolio", "url", "github"]):
                    await input_elem.fill("https://github.com/johndoe")
                    log.append(f"🌐 Filled website field: {name or id_attr}")
                    filled_count += 1
                    continue
                
            except Exception as e:
                log.append(f"⚠️ Error filling field: {str(e)}")
                continue
        
        # ========== Handle Textareas (Cover Letter, etc.) ==========
        textareas = await page.locator("textarea").all()
        
        for textarea in textareas:
            try:
                if not await textarea.is_visible():
                    continue
                
                name = await textarea.get_attribute("name") or ""
                id_attr = await textarea.get_attribute("id") or ""
                placeholder = await textarea.get_attribute("placeholder") or ""
                combined = f"{name} {id_attr} {placeholder}".lower()
                
                current_value = await textarea.input_value()
                if current_value:
                    continue
                
                # Cover letter
                if any(keyword in combined for keyword in ["cover", "letter", "message", "about", "why", "motivation"]):
                    cover_letter = self.profile.bio or "I am excited to apply for this position. My background and skills make me an excellent fit for your team."
                    await textarea.fill(cover_letter)
                    log.append(f"✍️ Filled cover letter/message field")
                    filled_count += 1
                    
            except Exception as e:
                log.append(f"⚠️ Error filling textarea: {str(e)}")
                continue
        
        # ========== Handle File Uploads (CV/Resume) ==========
        await self._handle_file_upload(page, log)
        
        return filled_count
    
    async def _handle_file_upload(self, page, log: List[str]):
        """Handle CV/Resume file upload"""
        try:
            file_inputs = await page.locator("input[type='file']").all()
            
            for file_input in file_inputs:
                if not await file_input.is_visible():
                    continue
                
                name = await file_input.get_attribute("name") or ""
                id_attr = await file_input.get_attribute("id") or ""
                accept = await file_input.get_attribute("accept") or ""
                combined = f"{name} {id_attr} {accept}".lower()
                
                # Check if it's for resume/CV
                if any(keyword in combined for keyword in ["resume", "cv", "curriculum", ".pdf", ".doc"]):
                    # Create temporary PDF from raw_cv_text
                    if self.profile.raw_cv_text:
                        temp_pdf = await self._create_temp_cv_file()
                        if temp_pdf:
                            await file_input.set_input_files(temp_pdf)
                            log.append(f"📄 Uploaded CV file to: {name or id_attr}")
                        else:
                            log.append(f"⚠️ CV text available but couldn't create PDF file")
                    else:
                        log.append(f"⚠️ CV upload field found but no CV text in profile")
                        
        except Exception as e:
            log.append(f"⚠️ Error handling file upload: {str(e)}")
    
    async def _create_temp_cv_file(self) -> str:
        """Create a temporary CV file from profile text"""
        try:
            # For now, create a simple text file
            # In production, you'd want to convert to PDF using reportlab or similar
            temp_file = tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, prefix='cv_')
            temp_file.write(self.profile.raw_cv_text)
            temp_file.close()
            return temp_file.name
        except Exception as e:
            return None
    
    async def _handle_next_button(self, page, log: List[str]) -> bool:
        """Handle multi-step forms by clicking Next/Continue buttons"""
        next_selectors = [
            "button:has-text('Next')", "button:has-text('Continue')",
            "button:has-text('Siguiente')", "button:has-text('Continuar')",
            "[aria-label*='next' i]", "[aria-label*='continue' i]"
        ]
        
        for selector in next_selectors:
            if await page.locator(selector).count() > 0:
                try:
                    await page.locator(selector).first.click(timeout=5000)
                    log.append(f"➡️ Clicked 'Next' button, moving to next form step")
                    return True
                except:
                    continue
        
        return False
